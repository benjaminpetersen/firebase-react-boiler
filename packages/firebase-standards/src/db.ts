import { CompanyId, join } from "./utils";
import * as z from "zod";

const companies = "companies/companies";
export const collections = {
  uniqueNames: "unique-names",
  fileStatusi: "file-statusi",
  companyUsers: "company-users",
  companyUsersPermissions: "company-user-permissions",
  companies,
  // Invites is only used to drive uis.
  invites: "invites/invites",
};

export type CollectionKeys = keyof typeof collections;

const collectionsMap = <V extends { [K in keyof typeof collections]: unknown }>(
  v: V,
) => v;

const getDateFromMethod = (data: unknown) => {
  const toDateZ = z.function(z.tuple([]), z.date());
  const toDateParse =
    data &&
    typeof data === "object" &&
    "toDate" in data &&
    typeof data.toDate === "function"
      ? toDateZ.safeParse(data.toDate.bind(data))
      : undefined;
  return toDateParse && toDateParse.success ? toDateParse.data() : undefined;
};

const fbDate = z
  .custom((v) => Boolean(getDateFromMethod(v)))
  .or(z.instanceof(Date))
  .transform((d) => (d instanceof Date ? d : getDateFromMethod(d)))
  .refine((f) => f !== undefined);

export const docPath = (collectionPath: string, id: string) =>
  join(collectionPath, id);

export const collectionLocations = (env: string) =>
  collectionsMap({
    uniqueNames: (ctx: CompanyId) =>
      join(env, companies, ctx.companyId, collections.uniqueNames),
    fileStatusi: ({ companyId }: { companyId: string }) =>
      join(env, companies, companyId, collections.fileStatusi),
    companyUsers: ({ companyId }: CompanyId) =>
      join(env, companies, companyId, collections.companyUsers),
    companyUsersPermissions: ({ companyId }: CompanyId) =>
      join(env, companies, companyId, collections.companyUsersPermissions),
    companies: () => join(env, collections.companies),
    invites: () => join(env, collections.invites),
  });

type CollectionLocations = ReturnType<typeof collectionLocations>;
export type CollectionLocationArgs = {
  [K in keyof CollectionLocations]: Parameters<CollectionLocations[K]>;
};

// TODO - learn about composition.. this is aweful
export const documentLocations = (env: string) => {
  const colPaths = collectionLocations(env);
  return collectionsMap({
    companies: (id: string) => docPath(colPaths.companies(), id),
    fileStatusi: (
      args: Parameters<(typeof colPaths)["fileStatusi"]>[0],
      id: string,
    ) => docPath(colPaths.fileStatusi(args), id),
    invites: (id: string) => docPath(colPaths.invites(), id),
    uniqueNames: (
      args: Parameters<(typeof colPaths)["uniqueNames"]>[0],
      id: string,
    ) => docPath(colPaths.uniqueNames(args), id),
    companyUsers: (
      args: Parameters<(typeof colPaths)["companyUsers"]>[0],
      id: string,
    ) => docPath(colPaths.companyUsers(args), id),
    companyUsersPermissions: (
      args: Parameters<(typeof colPaths)["companyUsers"]>[0],
      id: string,
    ) => docPath(colPaths.companyUsersPermissions(args), id),
  });
};

type DocLocations = ReturnType<typeof documentLocations>;
export type DocLocationArgs = {
  [K in keyof DocLocations]: Parameters<DocLocations[K]>;
};

const optionalTo = <Z extends z.ZodTypeAny, R extends null | undefined>(
  z: Z,
  ret: R,
) =>
  z
    .optional()
    .nullable()
    .default(null)
    .transform((v) => (v === null || v === undefined ? ret : v));

const maybeStrZ = <T extends null | undefined>(t: T) =>
  z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === undefined || v === null ? t : v));
const strZ = z.string();

const decimalZ = z.number().min(-1).max(1);

const bbz = z.object({
  x: decimalZ,
  y: decimalZ,
  width: decimalZ,
  height: decimalZ,
});

const pageBBz = z.object({
  bb: bbz,
  pageNumber: z.number(),
});

const pdfFieldRestrictions = <T extends null | undefined>(t: T) =>
  z.object({
    required: z.boolean(),
    maxLength: z
      .number()
      .optional()
      .nullable()
      .transform((v) => (v === null || v === undefined ? t : v)),
  });

const fileFieldZ = <T extends null | undefined>(t: T) =>
  z.object({
    fileGsUri: z.string(),
    name: z.string(),
    pageBB: z.array(pageBBz),
    restrictions: pdfFieldRestrictions(t),
  });

const fileBBz = z.object({
  gsUri: z.string(),
  pageNumber: z.number(),
  bb: bbz,
});

export type FileBB = z.infer<typeof fileBBz>;

const collectionTypesBuilder = <D extends null | undefined>(d: D) =>
  collectionsMap({
    companies: { name: maybeStrZ(d) },
    fileStatusi: {
      status: z.string(),
      gsUri: z.string(),
      createdAt: fbDate.default(now),
    },
    invites: {
      companyId: z.string(),
      status: z.enum(["invited", "completed"]).default("invited"),
    },
    uniqueNames: {
      renameCount: z.number(),
    },
    companyUsers: {
      name: maybeStrZ(d),
      avatarUrl: maybeStrZ(d),
      email: strZ.email(),
      phone: maybeStrZ(d),
    },
    companyUsersPermissions: {
      admin: z.boolean().default(false),
    },
  });

export const rawColTypes = collectionTypesBuilder(undefined);
export const collectionTypes = collectionsMap({
  companies: z.object(rawColTypes.companies),
  fileStatusi: z.object(rawColTypes.fileStatusi),
  invites: z.object(rawColTypes.invites),
  uniqueNames: z.object(rawColTypes.uniqueNames),
  companyUsers: z.object(rawColTypes.companyUsers),
  companyUsersPermissions: z.object(rawColTypes.companyUsersPermissions),
});

export type CollectionTypes = {
  [K in keyof typeof collectionTypes]: z.TypeOf<(typeof collectionTypes)[K]>;
};

export type WithId<T> = { id: string; data: T };

/**
 * The dream
 * The client gives some ability to fetch a document
 * We do a few of these for each type of db op -> get, set, findAll, update
 */
const now = () => new Date();
const dbDefaults = z.object({
  createdAt: fbDate.default(now),
  deletedAt: optionalTo(fbDate, null),
  status: z.string().default("current"),
  updatedAt: fbDate.default(now),
});

const dbCtypes = collectionTypesBuilder(null);

export const dbCollectionTypes = collectionsMap({
  companies: dbDefaults.extend(dbCtypes.companies),
  fileStatusi: dbDefaults.extend(dbCtypes.fileStatusi),
  invites: dbDefaults.extend(dbCtypes.invites),
  uniqueNames: z.object(dbCtypes.uniqueNames),
  companyUsers: dbDefaults.extend(dbCtypes.companyUsers),
  companyUsersPermissions: z.object(dbCtypes.companyUsersPermissions),
});

export type DBCollectionTypes = {
  [K in keyof typeof dbCollectionTypes]: z.TypeOf<
    (typeof dbCollectionTypes)[K]
  >;
};

export type DBInputTypes = {
  [K in keyof typeof dbCollectionTypes]: (typeof dbCollectionTypes)[K]["_input"];
};
