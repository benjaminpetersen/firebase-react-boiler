// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  HttpsCallableResult,
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import { getEnv, isEmulator } from "./env";
import {
  BackendFunctions,
  FunctionInput,
  FunctionResponseData,
  FetchResponse,
} from "@chewing-bytes/firebase-standards";
import { omit } from "lodash-es";
import { logError } from "./db";
import { devLogger } from "../../utils";
import { companyId } from "../../refactor";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
const config = {
  apiKey: import.meta.env.VITE_APP_APIKEY,
  authDomain: import.meta.env.VITE_APP_AUTHDOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECTID,
  storageBucket: import.meta.env.VITE_APP_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APP_APPID,
  measurementId: import.meta.env.VITE_APP_MEASUREMENTID,
};
const app = initializeApp(config);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const functions = getFunctions();
export const firebaseFunction = async <Endpoint extends BackendFunctions>(
  url: Endpoint,
  body: FunctionInput[Endpoint],
): Promise<FunctionResponseData[Endpoint]> => {
  const fn = httpsCallable(functions, url);
  const undefkeys = Object.keys(body).filter((k) => body[k] === undefined);
  const _json = await fn({
    data: omit(body, undefkeys),
    auth: { companyId: companyId, env: getEnv() },
  }).catch((e) => {
    logError(e);
    throw e;
  });
  const json = _json as HttpsCallableResult<
    FetchResponse<FunctionResponseData[Endpoint]>
  >;
  const messages = json.data.feedback || [];
  devLogger(`Launched ${url}:`, messages);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return json.data.data;
};

export const functionsUrl = (f: BackendFunctions) => `/functions/${f}`;

if (isEmulator()) {
  // Point to the emulators running on localhost
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  connectAuthEmulator(auth, "http://localhost:9099");
}
// const analytics = getAnalytics(app);
