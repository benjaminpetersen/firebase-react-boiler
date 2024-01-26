// This helper library will hold the standards for where stuff is stored, and what variables are needed to locate it, and possibly schemas to be shared and enforced by the frontend
export {
  collections,
  dbCollectionTypes,
  collectionTypes,
  collectionLocations,
  docPath,
  documentLocations,
  type FileBB,
  type CollectionTypes,
  type DBCollectionTypes,
  type CollectionKeys,
  type DocLocationArgs,
  type CollectionLocationArgs,
  type WithId,
} from "./db";
export {
  folders,
  companyStoragePathParts,
  isFolderName,
  storagePaths,
  fullPaths,
  type FileTypes,
} from "./storage";

export * from "./api-shared";
export * from "./api-firebase-functions";
export * from "./pubsub";
