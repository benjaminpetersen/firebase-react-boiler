import {
  RulesTestContext,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { a1c1 } from "./seed";
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import {
  BackendFunctions,
  FetchResponse,
  FunctionInput,
  FunctionResponseData,
} from "@chewing-bytes/firebase-standards";
import {
  connectAuthEmulator,
  getAuth as getClientAuth,
  signInWithCustomToken,
} from "firebase/auth";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { initializeApp } from "firebase/app";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { env } from "./init";
// TODO ON SETUP! This must be pulled from the firebase console. It's given on project setup, or from the settings.
const config = {
  apiKey: "apiKey",
  authDomain: "authDomain",
  projectId: "projectId",
  storageBucket: "storageBucket",
  messagingSenderId: "messagingSenderId",
  appId: "appId",
  measurementId: "measurementId",
};
initializeApp(config);
const emulatorHost = "127.0.0.1";
const functionsPort = 5001;
connectStorageEmulator(getStorage(), emulatorHost, 9199);
connectFirestoreEmulator(getFirestore(), emulatorHost, 8080);
connectFunctionsEmulator(getFunctions(), emulatorHost, functionsPort);
connectAuthEmulator(getClientAuth(), "http://localhost:9099");

export const getTestRunner =
  (testEnv: RulesTestEnvironment) =>
  async (
    user: typeof a1c1,
    testFunction: (args: {
      firestore: ReturnType<RulesTestContext["firestore"]>;
      storage: ReturnType<RulesTestContext["storage"]>;
      httpsFunction: <K extends BackendFunctions>(
        companyId: `c${number}`,
        type: K,
        data: FunctionInput[K],
      ) => Promise<
        | Readonly<{
            type: "success";
            data: FetchResponse<FunctionResponseData[K]>;
          }>
        | Readonly<{ type: "error"; code?: string }>
      >;
    }) => Promise<unknown>[] | Promise<unknown>,
  ) => {
    const testUser = testEnv.authenticatedContext(user.id);
    const firestore = testUser.firestore();
    const storage = testUser.storage();
    const pr = await testFunction({
      httpsFunction: async (companyId, type, body) => {
        const adminAuth = getAdminAuth();
        const signInToken = await adminAuth.createCustomToken(user.id);
        const clientAuth = getClientAuth();
        await signInWithCustomToken(clientAuth, signInToken);
        const fn = httpsCallable(getFunctions(), type, {});
        try {
          const res = await fn({
            data: body,
            auth: { companyId, env },
          });
          return {
            type: "success",
            data: res.data as FunctionResponseData[typeof type],
          };
        } catch (error) {
          const code =
            error &&
            typeof error === "object" &&
            "code" in error &&
            typeof error.code === "string"
              ? error.code
              : error instanceof Error
                ? error.message
                : undefined;
          return { type: "error", code };
        }
      },
      firestore,
      storage,
    });
    await Promise.all(Array.isArray(pr) ? pr : [pr]);
  };
