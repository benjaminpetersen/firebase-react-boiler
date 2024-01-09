/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  CollectionKeys,
  DBCollectionTypes,
} from "@chewing-bytes/firebase-standards";
import { firestore } from "./fb-lib/init";
import { onAuthedUserCall } from "./auth";
import { logger } from "firebase-functions";
import { colPaths, docPaths } from "./utils/env";
import { appSetDoc, appSetDocById } from "./fb-lib/api-server";

export const devGrants = onAuthedUserCall(
  "devGrants",
  { authArgs: undefined },
  async ({ auth: { userId: uid }, data: { isAdmin, companyId } }) => {
    if (!companyId) return {};
    const defaults: DBCollectionTypes["companyUsers"] = {
      createdAt: new Date(),
      deletedAt: new Date(),
      email: "some-email@email.com",
      name: "Set by DB",
      status: "",
      updatedAt: new Date(),
      avatarUrl: "",
      phone: "",
    };
    const docRef = firestore.doc(
      docPaths.companyUsers(
        {
          companyId,
        },
        uid,
      ),
    );
    const doc = await docRef.get();
    const d = doc.data();
    await appSetDocById(
      "companyUsers",
      {
        ...defaults,
        ...d,
        deletedAt: null,
      },
      { companyId },
      uid,
    );
    await appSetDocById(
      "companyUsersPermissions",
      { admin: isAdmin },
      { companyId },
      uid,
    );
    return {};
  },
);

export const devOnlySeed = onAuthedUserCall(
  "devOnlySeed",
  { authArgs: undefined },
  async ({ auth: { userId: uid }, data: { values, companyId } }) => {
    /** TODO - this is pretty dumb. Need to setup the db-scripts - */
    const valuesToSet: {
      [K in keyof DBCollectionTypes]?: (DBCollectionTypes[K] & {
        id?: string;
      })[];
    } = values;
    const ctx = { companyId: companyId || "", userId: uid };
    const el = await Promise.all(
      Object.entries(valuesToSet)
        .map(([_k, _v]) => {
          const k = _k as CollectionKeys;
          const v = _v as (typeof values)[typeof _k];
          try {
            return v.map((v: any) => {
              if (v.id) {
                return appSetDocById(k, v, ctx, v.id);
              }
              return appSetDoc(k, v, ctx);
            });
          } catch (error) {
            console.error("Whoops seeders", { error });
            return [];
          }
        })
        .flat(10000),
    ).catch((err) => console.error("WHOOPS SEEDERS", err));
    await Promise.all(
      valuesToSet?.companyUsers?.map((v) => {
        const id = v.id as string | undefined;
        if (id) return firestore.doc(docPaths.companyUsers(ctx, id)).set(v);
        else return firestore.collection(colPaths.companyUsers(ctx)).add(v);
      }) || [],
    );
    logger.info("SET " + el?.length);
    return {};
  },
);
