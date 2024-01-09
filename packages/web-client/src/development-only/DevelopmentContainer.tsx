/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from "react";
import { getEnv, isEmulator, setEnv } from "../network/firebase/env";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useCompanyUserRD, useIsAdmin } from "../network/firebase/hooks";
import { RD } from "@chewing-bytes/remote-data";
import { firebaseFunction } from "../network/firebase/init";
import { getValuesToSeed } from "./seeder";
import { Close, PanoramaFishEyeOutlined } from "@mui/icons-material";
import {
  getCompanyId,
  getUserId,
  setGlobalContext,
  useCtx,
} from "../state/context";
import { signOut } from "../network/firebase/functions";
import { compact } from "lodash-es";
import { zIndices } from "../utils/zIndex";
import { devLogger } from "../utils/logger";

const storageUrl = () => {
  const companyId = getCompanyId();
  return isEmulator()
    ? companyId
      ? `http://localhost:4000/storage/playgroundfree.appspot.com/${getEnv()}/companies/${encodeURIComponent(
          companyId,
        )}`
      : `http://localhost:4000/storage/playgroundfree.appspot.com/${getEnv()}/companies/`
    : "https://console.firebase.google.com/u/0/project/playgroundfree/storage/playgroundfree.appspot.com/files";
};

const join = (...str: string[]) => compact(str).join("/");

const dbUrl = () => {
  const companyId = getCompanyId();
  const userId = getUserId();
  return isEmulator()
    ? join(
        `http://localhost:4000/firestore/data`,
        getEnv(),
        companyId
          ? join(
              `companies/companies`,
              encodeURIComponent(companyId),
              userId ? join("company-users", encodeURIComponent(userId)) : "",
            )
          : "",
      )
    : "https://console.firebase.google.com/u/0/project/playgroundfree/firestore/data/~2Fben-dev~2Fcompanies";
};

export const DevelopmentContainer = () => {
  const persist = localStorage.getItem("show-dev-container") === "true";
  const [close, setClose] = useState(!persist);
  const [show, setShow] = useState(false);
  const user = useCompanyUserRD();
  const ctx = useCtx();
  const isAdmin = useIsAdmin();
  const setAdmin = async (args: { isAdmin: boolean }) => {
    firebaseFunction("devGrants", { ...args, companyId: getCompanyId() }).catch(
      console.error,
    );
  };
  const uid = RD.get(user)?.id;
  const seed = (values = getValuesToSeed(uid || "")) => {
    devLogger("SEEDING", values);
    firebaseFunction("devOnlySeed", { values, companyId: getCompanyId() });
  };

  useEffect(() => {
    // @ts-ignore
    window.showDev = (b?: boolean) => {
      const state = typeof b === "boolean" ? b : true;
      setShow(state);
      setClose(!state);
      localStorage.setItem("show-dev-container", "true");
    };
  }, []);
  if (close) return <></>;
  return (
    <div
      className="dev"
      style={{
        position: "absolute",
        padding: "10px",
        top: 0,
        left: 0,
        maxHeight: "100vh",
        overflow: "auto",
        zIndex: zIndices.devContainer,
        backgroundColor: "white",
      }}
    >
      <IconButton
        onClick={() => {
          setShow((s) => !s);
        }}
      >
        <PanoramaFishEyeOutlined />
      </IconButton>
      {show && (
        <IconButton
          onClick={() => {
            setClose(true);
          }}
        >
          <Close />
        </IconButton>
      )}
      {show && (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <TextField
            defaultValue={getEnv()}
            label="env"
            onBlur={(e) => {
              setEnv({ env: e.target.value });
            }}
          />
          <Typography>
            Use Emulator
            <Checkbox
              defaultChecked={isEmulator()}
              onChange={(e, checked) => {
                setEnv({ emulator: checked });
              }}
            />
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              window.open(dbUrl(), "_blank");
            }}
          >
            Database
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              window.open(storageUrl(), "_blank");
            }}
          >
            File Storage
          </Button>
          <TextField
            label="Company Id"
            fullWidth
            onChange={(e) => {
              setGlobalContext({ companyId: e.target.value });
            }}
            value={ctx.companyId}
          />
          <TextField
            label="User Id"
            fullWidth
            onChange={(e) => {
              setGlobalContext({ userId: e.target.value });
            }}
            value={ctx.userId}
          />
          {RD.get(user)?.data.admin ? (
            <Button
              variant="contained"
              onClick={() => {
                setAdmin({ isAdmin: false });
              }}
            >
              Revoke My Admin Privilege
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                setAdmin({ isAdmin: true });
              }}
            >
              Grant My Admin Privilege
            </Button>
          )}
          {!isAdmin ? (
            <Button
              variant="contained"
              onClick={() => {
                setGlobalContext({
                  devAdminUIOverwride: true,
                });
              }}
            >
              Use Admin UI
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                setGlobalContext({
                  devAdminUIOverwride: false,
                });
              }}
            >
              Use Standard UI
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => {
              seed();
            }}
          >
            Seed some data
          </Button>
          <Button
            fullWidth
            onClick={() => {
              signOut();
            }}
          >
            Signout
          </Button>
        </Box>
      )}
    </div>
  );
};
