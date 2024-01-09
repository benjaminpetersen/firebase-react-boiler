import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as logger from "firebase-functions/logger";
import pkg from "../package.json";
import { hardDeleteDocById } from "./fb-lib/db";
import { assertEnv, docPaths, getEnv } from "./utils/env";
import { onAuthedUserCall, onCall, onCompanyCall } from "./auth";
import { sendNotification } from "./notifications";
import { onRequest as onRequestFB } from "firebase-functions/v2/https";
import { auth } from "./fb-lib/init";
import {
  appGetDoc,
  appSetDoc,
  appSetDocById,
  appUpdateDoc,
} from "./fb-lib/api-server";
export { devOnlySeed, devGrants } from "./dev";
logger.info(`functions start: ${pkg?.version} | env: ${getEnv()}`);

/**
 * The entry point for all file upload
 *  1. Kick off OCR on pdf uploads
 *  2. Call the data science auto selections api on gapi ocr json upload
 *    a) Some other service will need to post
 *    selections from users on contract completion
 */
export const onFileUploaded = onObjectFinalized(
  { memory: "4GiB" },
  async (event) => {
    const [env, , companyId] = event.data.name.split("/");
    logger.info("File Upload Event: " + event.data.name);

    assertEnv(env);

    companyId &&
      appSetDoc(
        "fileStatusi",
        {
          status: "UPLOADED",
          gsUri: `gs://${event.data.bucket}/${event.data.name}`,
        },
        { companyId },
      );
    // Example event:
    // const example = {
    //     specversion: '1.0',
    //     id: '2393b050-3903-4ebc-a556-bb68461ff73f',
    //     type: 'google.cloud.storage.object.v1.finalized',
    //     source: '//storage.googleapis.com/projects
    //     /_/buckets/playgroundfree.appspot.com/objects/sample.pdf',
    //     time: '2023-11-03T17:10:44.160Z',
    //     data: {
    //       kind: 'storage#object',
    //       name: 'sample.pdf',
    // // this is the fullPath:
    // // "development/companies/aslijif83j/users/jf2oeffnc/...";
    //       bucket: 'playgroundfree.appspot.com',
    //       generation: '1699031444159',
    //       metageneration: '1',
    //       contentType: 'application/pdf',
    //       timeCreated: '2023-11-03T17:10:44.160Z',
    //       updated: '2023-11-03T17:10:44.160Z',
    //       storageClass: 'STANDARD',
    //       size: '18810',
    //       md5Hash: '2km743hVr2KmqICUU9F7gw==',
    //       etag: 'xA5BqMGuIUaP1t7DW4AcngPVk2Y',
    //       metadata: {
    // firebaseStorageDownloadTokens: '5465b273-17a6-4d61-8338-47eaf051eeaa'
    //       },
    //       crc32c: 'vvOeQA==',
    //       timeStorageClassUpdated: '2023-11-03T17:10:44.160Z',
    //       id: 'playgroundfree.appspot.com/sample.pdf/1699031444159',
    //       selfLink: 'http://127.0.0.1:9199/storage/v1/b/playgroundfree.appspot.com/o/sample.pdf',
    //       mediaLink:
    // 'http://127.0.0.1:9199/download/storage/v1/b/playgroundfree.appspot.com/o/sample.pdf?generation=1699031444159&alt=media'
    //     }
    //   }
  },
);

export const sendInviteToCompany = onCompanyCall(
  "sendInviteToCompany",
  { authArgs: { adminsOnly: true } },
  async ({ auth: { companyId }, data: { admin, email } }) => {
    // 1. Check if the user exists and fail if it does
    const existingUser = await auth
      .getUserByEmail(email)
      .catch(() => undefined);
    if (existingUser) {
      // Make sure they have no invites
      const inv = await appGetDoc("invites", existingUser.uid).catch(
        () => undefined,
      );
      if (inv)
        return {
          feedback: [
            {
              msg: `User already exists, please try a new email`,
              severity: "error",
            },
          ],
        };
    }
    // 2. Create an anonymous user, add to company-users and invites
    const user = existingUser || (await auth.createUser({ email }));
    await Promise.all([
      appSetDocById(
        "invites",
        {
          companyId,
          status: "invited",
        },
        user.uid,
      ),
      appSetDocById(
        "companyUsersPermissions",
        {
          admin,
        },
        { companyId },
        user.uid,
      ),
      appSetDocById(
        "companyUsers",
        {
          email,
        },
        {
          companyId,
        },
        user.uid,
      ),
    ]);
    await sendNotification({
      msg: `You've been invited`,
      link: `/?companyId=${companyId}`,
      user: { email },
    });
    return {
      feedback: [{ msg: `Sent invite to ${email}`, severity: "success" }],
    };
  },
);

export const deleteUser = onCompanyCall(
  "deleteUser",
  { authArgs: { adminsOnly: true } },
  async ({ data: { userId }, auth: { companyId } }) => {
    await Promise.all([
      hardDeleteDocById(
        docPaths.companyUsersPermissions({ companyId }, userId),
      ),
      appUpdateDoc("invites", { deletedAt: new Date() }, userId),
      appUpdateDoc(
        "companyUsers",
        { deletedAt: new Date() },
        { companyId },
        userId,
      ),
    ]);
    return {};
  },
);

export const createCompany = onAuthedUserCall(
  "createCompany",
  { authArgs: undefined },
  async ({ auth: { userId, email }, data: { name } }) => {
    // 1. Create Company
    const setComp = await appSetDoc("companies", { name });
    if (setComp.type === "parse-error")
      return {
        feedback: [
          {
            msg: "Something went wrong saving your company",
            severity: "error",
          },
        ],
      };
    const companyId = setComp.id;
    await Promise.all([
      // 2. Invite the user
      appSetDocById("invites", { companyId, status: "invited" }, userId),
      // 3. Create the user
      appSetDocById(
        "companyUsersPermissions",
        { admin: true },
        { companyId },
        userId,
      ),
      appSetDocById(
        "companyUsers",
        { email },
        {
          companyId,
        },
        userId,
      ),
    ]);
    return {
      feedback: [{ msg: "Created a new company", severity: "success" }],
      data: { companyId },
    };
  },
);

export const signUp = onCall(
  "signUp",
  { authArgs: undefined },
  async ({ data: { email, password } }) => {
    const u = await auth
      .getUserByEmail(email)
      .then((user) => ({ exists: true, user }) as const)
      .catch(() => ({ exists: false }) as const);
    if (u.exists && u.user.passwordHash) {
      return { data: { exists: true, token: "" } };
    }
    if (u.exists) {
      await auth.updateUser(u.user.uid, { password });
    }
    const user =
      u.exists && !u.user.passwordHash
        ? u.user
        : await auth.createUser({ email, password });
    const token = await auth.createCustomToken(user.uid);
    return {
      data: { token, exists: false },
    };
  },
);

export const echo = onRequestFB({}, async (req, res) => {
  res.send({ version: pkg?.version || "not-found", env: getEnv() });
});
