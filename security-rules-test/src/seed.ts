import { dbCollectionTypes } from "@chewing-bytes/firebase-standards";
import { DBCollectionTypes } from "@chewing-bytes/firebase-standards/src";
import { DocumentData, WithFieldValue } from "firebase-admin/firestore";
import { appDbPaths, appStoragePaths, bucket } from "./init";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";

type CollectionTypesID = {
  [K in keyof DBCollectionTypes]: DBCollectionTypes[K] & { id: string };
};

const withId = <T>(t: T, id: string) => ({ ...t, id });

// admin: authId.includes("a"),
const genUser = (
  authId: `${"a" | "s"}${number}c${number}`,
): CollectionTypesID["companyUsers"] =>
  withId(
    dbCollectionTypes.companyUsers.parse({
      authId,
      email: `${authId}@email.com`,
      name: authId,
    }),
    authId,
  );

// Admin users
export const a1c1 = genUser(`a1c1`);
export const a1c2 = genUser(`a1c2`);
export const s3c1a2c2Admin = genUser(`a2c2`);

// Standard c1 admin c2
export const s1c1 = genUser(`s1c1`);
export const s2c1 = genUser(`s2c1`);
export const s1c1a2c2Standard = s3c1a2c2Admin;
export const users = [a1c1, a1c2, s3c1a2c2Admin, s1c1, s2c1];

const genCompany = (id: `c${number}`): CollectionTypesID["companies"] =>
  withId(dbCollectionTypes.companies.parse({ name: id, status: "" }), id);
export const c1 = genCompany("c1");
export const c2 = genCompany("c2");
export const companies = [c1, c2];

// Contract Types
export const contractType: CollectionTypesID["contractTypes"] = withId(
  dbCollectionTypes.contractTypes.parse({
    fields: [],
    files: [],
    name: c1.id,
  }),
  "1",
);

export const contractTypes = [contractType];

// TODO: No default storage paths in the setup boiler...
// export const a1c1FilePath = appStoragePaths.contractType({
//   companyId: c1.id,
//   userId: a1c1.id,
//   baseName: a1c1.id,
//   ext: "json",
//   renameCount: 0,
// });

type DataPath = {
  path: string;
  data: WithFieldValue<DocumentData>;
};
const dataPath = (path: string, data: any): DataPath => {
  return { path, data };
};

export const toSet = [
  ...users.map((u) =>
    dataPath(
      appDbPaths.companyUsers(
        {
          companyId: `c${(u.name || "").split("c")[1]}`,
        },
        u.id,
      ),
      u,
    ),
  ),
  ...users.map((u) =>
    dataPath(
      appDbPaths.companyUsersPermissions(
        {
          companyId: `c${(u.name || "").split("c")[1]}`,
        },
        u.id,
      ),
      { admin: u.id[0] === "a" },
    ),
  ),
  dataPath(
    appDbPaths.companyUsers(
      {
        companyId: c1.id,
      },
      s1c1a2c2Standard.id,
    ),
    s1c1a2c2Standard,
  ),
  dataPath(
    appDbPaths.companyUsersPermissions(
      {
        companyId: c1.id,
      },
      s1c1a2c2Standard.id,
    ),
    { admin: false },
  ),
  ...companies.map((c) => dataPath(appDbPaths.companies(c.id), c)),
];

export const seed = async (
  firestore: FirebaseFirestore.Firestore,
  storage: ReturnType<typeof getStorage>,
) => {
  const adminAuth = getAuth();
  const set = async ({ path, data }: DataPath) => {
    path.split("/").length % 2 === 0
      ? await firestore.doc(path).set(data)
      : await firestore.collection(path).add(data);
  };
  await Promise.all([
    // C1 contract type file
    // storage
    //   .bucket(bucket)
    //   .file(a1c1FilePath)
    //   .save(JSON.stringify({ ok: "ok" })),
    // C2 standard user can read
    ...toSet.map(set),
    ...users.map((u) => adminAuth.createUser({ uid: u.id, email: u.email })),
  ]);

  await Promise.all(toSet.map(set));
};
