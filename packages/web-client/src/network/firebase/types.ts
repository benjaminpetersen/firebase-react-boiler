import { WithId as FBWithId } from "@chewing-bytes/firebase-standards";

export type WithId<T> = FBWithId<T>;

export type AppErr = {msg?: string};