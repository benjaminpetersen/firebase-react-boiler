import { join } from "./utils";

export const folders = { example: "example" } as const;

export type FileTypes = (typeof folders)[keyof typeof folders];

const folderNames = Object.values(folders);

type FolderNames = (typeof folders)[keyof typeof folders];
export const isFolderName = (str: string): str is FolderNames =>
  Boolean(folderNames.find((fn) => fn === str));

type Renameable = { baseName: string; renameCount?: number; ext: string };

export const storagePaths = (env: string) => ({
  example: (companyId: string) =>
    join(env, "companies", companyId, folders.example),
});

export const fullPaths = (env: string) => ({
  example: (ctx: { companyId: string } & Renameable) =>
    join(
      storagePaths(env).example(ctx.companyId),
      ctx.baseName,
      ctx.renameCount?.toString(),
      ctx.ext,
    ),
});

type InputType = {
  fileName: string;
  baseName: string;
  companyId: string;
};

/**
 *
 * @param fullPath in the form `${env}/companies/${companyId}/${folderName}/${fileName}`
 * @returns
 */
export const companyStoragePathParts = (
  fullPath: string,
): undefined | InputType => {
  const [, , companyId, folderName, ...others] = fullPath.split("/");
  if (companyId && folderName && isFolderName(folderName)) {
    switch (folderName) {
      case "example":
        if (others[0] && others[1])
          return { baseName: others[0], companyId, fileName: others[1] };
    }
    return undefined;
  }
};
