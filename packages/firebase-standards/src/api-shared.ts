/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  CollectionKeys,
  CollectionLocationArgs,
  CollectionTypes,
  DocLocationArgs,
  collectionLocations,
  dbCollectionTypes,
  documentLocations,
  collectionTypes,
  DBInputTypes,
} from "./db";
import {
  ParseError,
  SuccessFail,
  dataRt,
  parseErr,
  failE,
  Data,
} from "./api-types";
import pick from "lodash/pick";

type DocumentData = { [x: string]: any };

const keysof = <T extends object>(t: T): (keyof T)[] =>
  Object.keys(t) as (keyof T)[];

const stripUndefs = <T extends object>(t: T) => {
  const defKeys = keysof(t).filter((k) => t[k] !== undefined);
  return pick(t, defKeys);
};

export const parseDBValsAndMap = <K extends CollectionKeys>(
  k: K,
  id: string,
  data: unknown,
): Data<CollectionTypes[K]> | ParseError => {
  const res = collectionTypes[k].safeParse(data);
  if (!res.success) return parseErr(res.error);
  const d = res.data as unknown as CollectionTypes[K];
  return dataRt(d, id);
};

export const getDocBuilder =
  (
    getter: (
      path: string,
    ) => Promise<{ data: DocumentData; id: string } | undefined>,
  ) =>
  (env: string) =>
  async <K extends CollectionKeys>(
    k: K,
    ...params: DocLocationArgs[K]
  ): Promise<SuccessFail<CollectionTypes[K], "not-found">> => {
    const paths = documentLocations(env)[k];
    // @ts-ignore
    const path = paths(...params);
    const data = await getter(path);
    if (!data) return failE("not-found");
    return parseDBValsAndMap(k, data.id, data.data);
  };

export const setDocBuilder =
  (setter: (path: string, data: DocumentData) => Promise<{ id: string }>) =>
  (env: string) =>
  async <K extends CollectionKeys>(
    k: K,
    data: DBInputTypes[K],
    ...params: CollectionLocationArgs[K]
  ): Promise<ParseError | Data<undefined>> => {
    const paths = collectionLocations(env)[k];
    // @ts-expect-error
    const path = paths(...params);
    const parse = dbCollectionTypes[k].safeParse(data);
    if (!parse.success) return parseErr(parse.error);
    const id = await setter(path, parse.data);
    return dataRt(undefined, id.id);
  };

export const setDocByIdBuilder =
  (setter: (path: string, data: DocumentData) => Promise<void>) =>
  (env: string) =>
  async <K extends CollectionKeys>(
    k: K,
    data: DBInputTypes[K],
    ...params: DocLocationArgs[K]
  ): Promise<ParseError | void> => {
    const paths = documentLocations(env)[k];
    // @ts-expect-error
    const path = paths(...params);
    const parse = dbCollectionTypes[k].safeParse(data);
    if (!parse.success) return parseErr(parse.error);
    await setter(path, parse.data);
  };

export const updateDocBuilder =
  (updater: (path: string, data: DocumentData) => Promise<void>) =>
  (env: string) =>
  async <K extends CollectionKeys>(
    k: K,
    data: Partial<DBInputTypes[K]>,
    ...params: DocLocationArgs[K]
  ) => {
    const paths = documentLocations(env)[k];
    // @ts-expect-error
    const path = paths(...params);
    const parse = dbCollectionTypes[k]
      .partial()
      .safeParse(stripUndefs({ updatedAt: new Date(), ...data }));
    if (!parse.success) return parseErr(parse.error);
    await updater(path, parse.data);
    return;
  };

// TODO whereEq
// const getDocsWhereEq =
//   <K extends keyof CollectionTypes>(k: K & keyof CollectionTypes) =>
//   async (
//     { omitSoftDeletes = true }: { omitSoftDeletes?: boolean },
//     whereEq: Partial<CollectionTypes[K]>,
//     ...args: Parameters<ReturnType<typeof collectionLocations>[K]>
//   ): Promise<WithId<CollectionTypes[K]>[]> => {
//     // TODO - this can be improved with validators
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     const _colRef: Query = firestore.collection(colPaths[k](...args));
//     const colRef = omitSoftDeletes
//       ? _colRef.where("deletedAt", "==", null)
//       : _colRef;
//     const query = Object.entries(whereEq).reduce(
//       (colRef, el) => colRef.where(el[0], "==", el[1]),
//       colRef,
//     );
//     const res = await query.get();

//     return res.docs.map((r) => ({
//       id: r.id,
//       data: mapDoc(r.data()) as CollectionTypes[K],
//     }));
//   };
