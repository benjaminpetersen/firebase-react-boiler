/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  doc,
  collection,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import {
  getDocBuilder,
  setDocBuilder,
  setDocByIdBuilder,
  updateDocBuilder,
  CollectionKeys,
  CollectionLocationArgs,
  DBCollectionTypes,
  DocLocationArgs,
  dbCollectionTypes,
  CollectionTypes,
  collectionTypes,
} from "@chewing-bytes/firebase-standards";
import { getEnv } from "./env";
import { collectionPaths, docPaths, logError } from "./db";
import React, { useMemo, useState } from "react";
import { firestore } from "./init";
import { compact } from "lodash-es";
import { RD, RemoteData } from "@chewing-bytes/remote-data";
import { AppErr } from "../../domains/errors";
import { WithId } from "./types";
import { useLimitOffset } from "./hooks";
import * as z from "zod";
export const appGetDoc = getDocBuilder(async (path: string) => {
  const d = await getDoc(doc(firestore, path));
  const data = d.data();
  if (data) return { data, id: d.id };
  return;
})(getEnv());

export const appSetDoc = setDocBuilder(async (path, data) => {
  const res = await addDoc(collection(firestore, path), data);
  return { id: res.id };
})(getEnv());

export const appSetDocById = setDocByIdBuilder(async (path, data) => {
  await setDoc(doc(firestore, path), data);
})(getEnv());

export const appUpdateDoc = updateDocBuilder(async (path, data) => {
  await updateDoc(doc(firestore, path), data);
})(getEnv());

const docsCache = new Map<string, unknown>();
const timeouts: Record<string, ReturnType<typeof setTimeout>> = {};
const fiveMin = 1000 * 60 * 5;
const cleanCache = (path: string) => {
  clearTimeout(timeouts[path]);
  setTimeout(() => {
    docsCache.delete(path);
  }, fiveMin);
};

const getDocCache = <T>(path: string, def: T) => {
  cleanCache(path);
  return (docsCache.get(path) as T) || def;
};

const setDocCache = (path: string, d: unknown) => {
  docsCache.set(path, d);
};

export const useLiveDoc = <K extends CollectionKeys>(
  k: K,
  params?: DocLocationArgs[K],
) => {
  const paths = docPaths[k];
  // @ts-expect-error
  const path = params ? paths(...params) : undefined;
  const cachedDoc = useMemo(
    () =>
      path
        ? { path, rd: getDocCache(path, RD.initialized) }
        : { path, rd: RD.initialized },
    [path],
  );
  const [_rd, setRD] = useState<{
    path?: string;
    rd: RemoteData<WithId<CollectionTypes[K]>, AppErr>;
  }>(cachedDoc);
  const rd = _rd?.path !== path ? RD.initialized : _rd.rd;
  React.useEffect(() => {
    if (path) setRD({ path, rd: RD.pending });
    const unsub = path
      ? onSnapshot(
          doc(firestore, path),
          (doc) => {
            const d = collectionTypes[k].safeParse(doc.data());
            if (d.success) {
              // @ts-expect-error
              const data: WithId<CollectionTypes[K]> = {
                data: d.data,
                id: doc.id,
              };
              const ret = RD.success(data);
              setRD({ path, rd: ret });
              setDocCache(path, ret);
            } else {
              logError(d.error);
              setRD({
                path,
                rd: RD.failure({
                  msg: doc.exists()
                    ? "Information is not formatted correctly"
                    : "Not found",
                }),
              });
            }
          },
          (err) => {
            logError(err);
            setRD({ rd: RD.failure({ msg: "Failed to fetch data" }), path });
          },
        )
      : undefined;
    return () => {
      unsub?.();
    };
  }, [path]);
  return rd;
};

type ReadonlyOrMutable<T> = T | Readonly<T>;

type AllowedQuereies = "eq" | "lte" | "gte" | "lt" | "gt" | "contains" | "in";
type SingleWhere<K extends string> = ReadonlyOrMutable<
  [K, AllowedQuereies, string | number | string[] | number[]]
>;
const qToFB = (k: AllowedQuereies): Parameters<typeof where>[1] => {
  switch (k) {
    case "eq":
      return "==";
    case "gt":
      return ">";
    case "lt":
      return "<";
    case "gte":
      return ">=";
    case "lte":
      return "<=";
    case "contains":
      return "array-contains";
    case "in":
      return "in";
  }
};
type Wheres<
  K extends CollectionKeys,
  V extends DBCollectionTypes[K],
> = ReadonlyOrMutable<SingleWhere<Extract<keyof V, string>>[]>;

/**
 *
 * @param k - CollectionKeys
 * @param wheres - The filters to use, undefined will return initialized
 * @param latestFirst - Order on createdAt field if it exists.
 *
 * @returns
 */
export const useLiveDocs = <K extends CollectionKeys>(
  k: K,
  {
    wheres,
    omitSoftDeletes = true,
    latestFirst = true,
    location,
    limit: propLimit,
    limitOffset,
  }: {
    wheres?: Wheres<K, DBCollectionTypes[K]>;
    omitSoftDeletes?: boolean;
    latestFirst?: boolean;
    location?: CollectionLocationArgs[K];
    limit?: number;
    limitOffset?: Pick<
      ReturnType<typeof useLimitOffset>,
      "limit" | "page" | "setTotalPageNumber"
    >;
  },
) => {
  const [rd, setRD] = useState<
    RemoteData<WithId<CollectionTypes[K]>[], AppErr>
  >(RD.initialized);
  const paths = collectionPaths[k];
  const limitNumber = limitOffset?.limit || propLimit;
  const page = limitOffset?.page;
  const setTotalPageNumber = limitOffset?.setTotalPageNumber;

  // @ts-expect-error
  const path = location ? paths(...location) : undefined;
  const paginationAnchorsRef = React.useRef<
    QueryDocumentSnapshot<unknown, DocumentData>[]
  >([]);
  const pagination = paginationAnchorsRef.current;
  const addAnchor = (snap: QueryDocumentSnapshot<unknown, DocumentData>) => {
    if (!pagination.find((c) => c.id === snap.id)) pagination.push(snap);
  };
  React.useEffect(() => {
    // @ts-ignore
    const hasCreatedAt = "createdAt" in dbCollectionTypes[k].shape;
    const orderByCreatedAt =
      latestFirst && hasCreatedAt ? orderBy("createdAt", "desc") : undefined;
    const hasDeletedAt = "deletedAt" in dbCollectionTypes[k].shape;
    const whereNotDeleted =
      omitSoftDeletes && hasDeletedAt
        ? where("deletedAt", "==", null)
        : undefined;
    if (wheres && path) setRD(RD.pending);
    const pageIndex = page && page - 2 >= 0 ? page - 2 : undefined;
    const last =
      typeof pageIndex === "number" ? pagination[pageIndex] : undefined;
    const countsQuery: Parameters<typeof query> | undefined =
      wheres && path
        ? [
            collection(firestore, path),
            ...(orderByCreatedAt ? [orderByCreatedAt] : []),
            ...(whereNotDeleted ? [whereNotDeleted] : []),
            ...wheres.map(([key, modifier, value]) =>
              where(key, qToFB(modifier), value),
            ),
          ]
        : undefined;
    if (k === "companyUsersPermissions")
      console.log(
        "AAAAH",
        limitNumber,
        last,
        orderByCreatedAt,
        whereNotDeleted,
      );
    const fullQuery = countsQuery
      ? query(
          ...countsQuery,
          ...(typeof limitNumber === "number" ? [limit(limitNumber)] : []),
          ...(typeof last !== "undefined" ? [startAfter(last)] : []),
        )
      : undefined;
    setTotalPageNumber &&
      countsQuery &&
      getCountFromServer(query(...countsQuery))
        .then((v): void => {
          const count = v.data().count;
          setTotalPageNumber(Math.ceil(count / 10));
        })
        .catch(logError);
    const unsub = fullQuery
      ? onSnapshot(fullQuery, (snapshot): void => {
          setRD(
            RD.success(
              compact(
                snapshot.docs.map((d) => {
                  const data = collectionTypes[k].safeParse(d.data());
                  if (!data.success) {
                    logError("Failed parse", data.error);
                    return undefined;
                  }
                  // @ts-expect-error
                  const parseRes: CollectionTypes[K] = data.data;
                  const ret: WithId<CollectionTypes[K]> = {
                    id: d.id,
                    data: parseRes,
                  };
                  return ret;
                }),
              ),
            ),
          );
          const last = limitNumber && snapshot.docs[limitNumber - 1];
          last && addAnchor(last);
        })
      : undefined;
    return () => {
      unsub?.();
    };
  }, [
    limitNumber,
    page,
    setTotalPageNumber,
    omitSoftDeletes,
    latestFirst,
    path,
    JSON.stringify(wheres),
  ]);
  return rd;
};
