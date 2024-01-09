import {
  CallableRequest,
  HttpsError,
  HttpsOptions,
  Request,
  onRequest as fbOnRequest,
  onCall as fbOnCall,
} from "firebase-functions/v2/https";
import { Response } from "express";
import { auth } from "../fb-lib/init";
import { assertEnv } from "../utils/env";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { DecodedIdToken } from "firebase-admin/auth";
import { appGetDoc } from "../fb-lib/api-server";
import {
  BackendFunctions,
  FunctionRequestData,
  FunctionResponseData,
  functionRequestData,
} from "@chewing-bytes/firebase-standards";
import { FetchResponse } from "@chewing-bytes/firebase-standards";

type AuthUser = Pick<
  DecodedIdToken,
  "uid" | "picture" | "phone_number" | "email"
>;

type AuthResult<T> = E.Either<FetchResponse, T>;

const getEnv = (req: Request) => assertEnv(req?.body?.auth?.env);

const isStr = (
  v: unknown,
  e: FetchResponse,
): E.Either<FetchResponse, string> =>
  typeof v === "string" ? E.right(v) : E.left(e);

const needCompanyErr: FetchResponse = {
  needToBeCompanyUser: "Missing Company",
};

const needUserErr: FetchResponse = {
  needToBeUser: "You must be logged in",
};

const getCompanyId = (req: Request) =>
  isStr(req?.body?.auth?.companyId, needCompanyErr);

// Duplicated From /home/ben/w/ft/packages/web-client/src/network/firebase/db.ts
export const transposeEitherPr = async <L, R>(
  either: E.Either<Promise<L> | L, Promise<R> | R>,
): Promise<E.Either<L, R>> =>
  E.isLeft(either) ? E.left(await either.left) : E.right(await either.right);

const getUser = async (
  req: Request,
): Promise<E.Either<FetchResponse, DecodedIdToken>> =>
  pipe(
    isStr(req.body?.auth?.token, needUserErr),
    E.map(auth.verifyIdToken.bind(auth)),
    transposeEitherPr,
  );

export type Handler<
  Auth = undefined,
  RequestData = undefined,
  FetchResponseData = undefined,
> = (args: {
  auth: Auth;
  data: RequestData;
}) =>
  | FetchResponse<FetchResponseData>
  | Promise<FetchResponse<FetchResponseData>>;

export const onRequestHOF =
  <Auth = undefined, AuthArgs = undefined>(
    getAuth: (
      req: Request,
      res: Response,
      authArgs: AuthArgs,
    ) => Promise<AuthResult<Auth>> | AuthResult<Auth>,
  ) =>
  <Url extends BackendFunctions>(
    url: Url,
    opts: { http?: HttpsOptions; authArgs: AuthArgs },
    handler: Handler<Auth, FunctionRequestData[Url], FunctionResponseData[Url]>,
  ) => {
    return fbOnRequest(
      {
        ...opts.http,
        cors: typeof opts.http?.cors === "boolean" ? opts.http.cors : true,
      },
      async (req, res) => {
        try {
          assertEnv(getEnv(req));
          const bodyParse = functionRequestData[url].safeParse(req.body.data);
          const auth = await getAuth(req, res, opts.authArgs);
          const response: FetchResponse =
            E.isRight(auth) && bodyParse.success
              ? await handler({
                  auth: auth.right,
                  data: req.body.data,
                })
              : E.isLeft(auth)
                ? auth.left
                : { feedback: [{ msg: "Bad request", severity: "error" }] };
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(response));
        } catch (error) {
          console.error("Something went wrong", error);
          res.sendStatus(500);
        }
      },
    );
  };

const validateUser = (userAuth: AuthUser) => {
  return pipe(
    E.right((email: string) => {
      return {
        email,
        userId: userAuth.uid,
        avatarUrl: userAuth.picture,
        phone: userAuth.phone_number,
      };
    }),
    E.ap(
      isStr(userAuth.email, {
        needToBeUser: "Your account is missing an email",
      }),
    ),
  );
};

export const onCallHOF =
  <Auth = undefined, AuthArgs = undefined>(
    getAuth: (
      req: CallableRequest,
      args: AuthArgs,
    ) => AuthResult<Auth> | Promise<AuthResult<Auth>>,
  ) =>
  <Url extends BackendFunctions>(
    url: Url,
    opts: { http?: HttpsOptions; authArgs: AuthArgs },
    handler: Handler<Auth, FunctionRequestData[Url], FunctionResponseData[Url]>,
  ) =>
    fbOnCall({}, async (req) => {
      assertEnv(req.data?.auth?.env);
      const auth = await getAuth(req, opts.authArgs);
      const data = functionRequestData[url].safeParse(req.data.data);
      if (!data.success) {
        console.error("failed request", data.error);
        throw new HttpsError("failed-precondition", "Invalid post data");
      }
      if (E.isLeft(auth)) {
        console.log("failed request on auth", auth);
        throw new HttpsError(
          "unauthenticated",
          "You're missing the neccessary authentication",
        );
      }
      return await handler({ auth: auth.right, data: data.data });
    });

export const onCall = onCallHOF(() => E.right(undefined));
export const onAuthedUserCall = onCallHOF(async (req) => {
  const noauth: FetchResponse = { needToBeUser: "Please login" };
  return pipe(
    req.auth,
    E.fromNullable(noauth),
    E.map((a) => a.token),
    E.chain(validateUser),
  );
});

export const onRequest = onRequestHOF(() => E.right(undefined));

export const onAuthedUserRequest = onRequestHOF(async (req) => {
  return pipe(await getUser(req), E.chain(validateUser));
});

type CompanyRules = { adminsOnly?: boolean };

const checkCompanyRules = async (
  rules: CompanyRules,
  userE: E.Either<FetchResponse, Pick<DecodedIdToken, "uid">>,
  companyIdE: E.Either<FetchResponse, string>,
) => {
  if (E.isLeft(userE)) return E.left({ needToBeUser: "You must be signed in" });
  if (E.isLeft(companyIdE))
    return E.left({
      needToBeCompanyUser: "You must belong to an organization",
    });
  const companyUserPermissions = await appGetDoc(
    "companyUsersPermissions",
    { companyId: companyIdE.right },
    userE.right.uid,
  );
  if (companyUserPermissions.type !== "success")
    return E.left({
      needToBeCompanyUser: "You must belong to an organization",
    });
  const isAdmin = companyUserPermissions.data.admin;
  const authData = {
    userId: userE.right.uid,
    companyId: companyIdE.right,
    isMember: Boolean(userE.right),
    isAdmin,
  };
  if (rules.adminsOnly && !isAdmin) {
    return E.left({ needAdmin: "You are not an admin" });
  }
  return E.right(authData);
};

type CompanyAuth = {
  userId: string;
  companyId: string;
  isMember: boolean;
  isAdmin: boolean;
};

export const onCompanyRequest = onRequestHOF<CompanyAuth, CompanyRules>(
  async (req, _res, rules) => {
    const companyIdE = getCompanyId(req);
    const userE = await getUser(req);
    return await checkCompanyRules(rules, userE, companyIdE);
  },
);

export const onCompanyCall = onCallHOF<CompanyAuth, CompanyRules>(
  async (req, rules) => {
    const noAuth: FetchResponse = { needToBeUser: "You must be logged in" };
    const noCompany: FetchResponse = {
      needToBeCompanyUser: "You must belong to an organization",
    };
    const userE = pipe(req.auth, E.fromNullable(noAuth));
    const companyIdE = pipe(req.data.auth.companyId, E.fromNullable(noCompany));
    return await checkCompanyRules(rules, userE, companyIdE);
  },
);
