// interp strings to follow the firebase routes
import React, { useContext } from "react";
import { RD, RemoteData } from "@chewing-bytes/remote-data";
import { AppErr } from "../../domains/errors";
import { FileAndGsUri, FileRD, gsUriToFile } from "./files";
import { logError } from "./db";
import { useCompanyId, useCtx, useUserId } from "../../state/context";
import { AuthContext } from "../../containers/AuthProvider";
import { useLiveDoc, useLiveDocs } from "./api-client";
import { clamp } from "lodash-es";

export const useIsAdmin = () => {
  const overwride = useCtx().devAdminUIOverwride;
  const companyRD = useCompanyUserRD();
  return typeof overwride === "boolean"
    ? overwride
    : Boolean(RD.get(companyRD)?.data.admin);
};

export const useAuthedUserRD = () => useContext(AuthContext);

export const useIsAuthedRD = () => RD.map(useAuthedUserRD(), Boolean);

type LimitOffest = ReturnType<typeof useLimitOffset>;

export const useLimitOffset = () => {
  const [page, _setPage] = React.useState(1);
  const [totalPageNumber, setTotalPageNumber] = React.useState<number>();
  const setPage = (pageNum: number) => {
    _setPage(
      totalPageNumber
        ? clamp(pageNum, 1, totalPageNumber)
        : pageNum < 1
          ? 1
          : pageNum,
    );
  };
  return {
    limit: 10,
    page,
    setPage,
    totalPageNumber,
    setTotalPageNumber,
  };
};

type RTFile<FileType> = RemoteData<FileAndGsUri<FileType>, AppErr>;

export const gsUrisToDL =
  <RT = File>(map: (f: File, gsUri: string) => Promise<RT> | RT) =>
  (
    _gsUris: { gsUri: string; name?: string }[],
  ): { fileRD: FileRD<RT>; gsUri: string }[] => {
    const [filesRD, setFilesRD] = React.useState<Record<string, RTFile<RT>>>(
      {},
    );
    // subscribe to file changes on firestore.
    const gsUrisStr = _gsUris
      .map((g) => g.gsUri)
      .sort()
      .join(",");
    const gsUris = React.useMemo(() => {
      return gsUrisStr.split(",").filter((v) => v);
    }, [gsUrisStr]);

    const _update = React.useCallback(
      (gsUri: string) => (rd: RTFile<RT>) => {
        setFilesRD((vals) => ({ ...vals, [gsUri]: rd }));
      },
      [setFilesRD],
    );
    React.useEffect(() => {
      gsUris.forEach((gsUri) => {
        const update = _update(gsUri);
        const oldVal = filesRD[gsUri] || RD.initialized;
        if (oldVal.type === "initialized") {
          update(RD.pending);
          gsUriToFile({ gsUri })
            .then(async (res) =>
              RD.success({ file: await map(res, gsUri), gsUri }),
            )
            .then(update)
            .catch((err) => {
              logError("Failed to load file", err, gsUri);
              update(RD.failure({ msg: "Failed to load file" }));
            });
        }
      });
    }, [gsUris, _update]);
    return React.useMemo(
      () =>
        _gsUris?.map(({ gsUri }) => ({
          gsUri,
          fileRD: filesRD[gsUri] || RD.initialized,
        })) || [],
      [filesRD, _gsUris],
    );
  };

export const useGsUrisToFiles = gsUrisToDL((f) => f);

// const fileToJSON = <JSONType = object>(f: File) =>
//   f.text().then((t) => JSON.parse(t) as unknown as JSONType);

export const useCompanyUserRD = () => {
  const userId = useUserId();
  const companyId = useCompanyId();
  const companyuserRD = useLiveDoc(
    "companyUsers",
    userId && companyId ? [{ companyId }, userId] : undefined,
  );
  const permissionsRD = useLiveDoc(
    "companyUsersPermissions",
    userId && companyId ? [{ companyId }, userId] : undefined,
  );
  return RD.map(
    RD.all([companyuserRD, permissionsRD]),
    ([user, permissions]) => ({
      ...user,
      data: { ...user.data, admin: permissions.data.admin },
    }),
  );
};

export const useUsersRD = () => {
  const companyId = useCompanyId();
  const allUsersRD = useLiveDocs("companyUsers", {
    location: companyId ? [{ companyId }] : undefined,
    wheres: [],
  });
  const adminsRD = useLiveDocs("companyUsersPermissions", {
    location: companyId ? [{ companyId }] : undefined,
    wheres: [],
  });
  console.log("PERMS", adminsRD);
  return RD.map(RD.all([allUsersRD, adminsRD]), ([currentUsers, admins]) => {
    return {
      currentUsers: currentUsers.map((u) => ({
        ...u,
        data: {
          ...u.data,
          admin: Boolean(admins.find((a) => a.id === u.id && a.data.admin)),
        },
      })),
    };
  });
};
