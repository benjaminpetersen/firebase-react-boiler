import { doc, runTransaction } from "firebase/firestore";
import sha1 from "sha1";
import { getEnv } from "./env";
import { firebaseFunction, firestore } from "./init";
import * as E from "fp-ts/Either";
import {
  collectionLocations,
  documentLocations,
} from "@chewing-bytes/firebase-standards";
import { appUpdateDoc } from "./api-client";
import { getCompanyId } from "../../refactor";

const env = getEnv();
export const collectionPaths = collectionLocations(env);
export const docPaths = documentLocations(env);
const docRefFromPath = ({ path }: { path: string }) => doc(firestore, path);
/**
 * This collection will need the database rules to allow only reading and creating
 * @param str - string to get a unique count for for i.e. "/companies/<company>/users/<user>/<folderName>/<fileName>.<ext>", then count gives
 * @return Promise<renameCount> - The count to append to the filename. i.e. - <filename>-<renameCount>.ext
 * */
const getRenameCount = async (str: string): Promise<number> => {
  return runTransaction(firestore, async (t) => {
    const docRef = docRefFromPath({
      path: docPaths.uniqueNames(
        sha1(str),
      ),
    });
    const data = await t.get(docRef)?.then((d) => d.data());
    const count = data?.renameCount || 0;
    const renameCount = count + 1;
    t.set(docRef, { renameCount });
    return renameCount;
  });
};

export const logError = (...args: Parameters<typeof console.error>) =>
  console.error(...args);

const retry = async <RT>(
  fn: () => RT | Promise<RT>,
  limit = 5,
  attempt = 0,
): Promise<E.Either<string, RT>> => {
  if (attempt >= limit) return E.left(`Failed after retrying ${attempt} times`);
  try {
    return E.right(await fn());
  } catch (error) {
    logError(error);
    return retry(fn, limit, attempt + 1);
  }
};

export const fileDataToName = (d: {
  baseName: string;
  renameCount: number;
  folder: string;
  ext: string;
}) => `${d.baseName}-${d.renameCount}.${d.ext}`;

export const getUniqueRenameCount = async (
  data: string,
): Promise<E.Either<string, number>> => retry(() => getRenameCount(data));

export const transposeEitherPr = async <L, R>(
  either: E.Either<Promise<L> | L, Promise<R> | R>,
): Promise<E.Either<L, R>> =>
  E.isLeft(either) ? E.left(await either.left) : E.right(await either.right);

export const deleteUser = async (userId: string) => {
  await firebaseFunction("deleteUser", { userId });
};

export const setUserAdmin = async ({
  admin,
  id,
}: {
  id: string;
  admin: boolean;
}) => {
  const companyId = getCompanyId();
  if (companyId) {
    appUpdateDoc("companyUsersPermissions", { admin }, { companyId }, id);
  }
};
