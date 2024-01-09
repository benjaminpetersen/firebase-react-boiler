import { Button, CircularProgress, Select, SelectProps } from "@mui/material";
import { RemoteDataRender } from "./RemoteDataRender";
import Add from "@mui/icons-material/Add";
import React from "react";
import { RemoteData } from "@chewing-bytes/remote-data";
import { useLimitOffset } from "../network/firebase/hooks";
import { LimitOffset } from "../components/LimitOffset";

const Loading = () => (
  <Select startAdornment={<CircularProgress />} fullWidth value="" />
);
export const SelectRDContainer = <D, E>({
  onCreate,
  renderItem,
  value,
  onChange,
  rd,
  limitOffset,
  ...selectProps
}: {
  onCreate?: () => void;
  renderItem: (d: D) => React.ReactNode;
  rd: RemoteData<D[], E>;
  onChange?: (s: string) => void;
  value?: string;
  limitOffset?: ReturnType<typeof useLimitOffset>;
} & SelectProps<string>) => {
  const [_selected, _setSelected] = React.useState(value || "");
  const selected = value || _selected;
  const setSelected = (v: string) => {
    _setSelected(v);
    onChange?.(v);
  };
  return (
    <RemoteDataRender
      remoteData={rd}
      success={(data) => {
        return (
          <Select
            fullWidth
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
            }}
            {...selectProps}
          >
            {data.map(renderItem)}
            {limitOffset && <LimitOffset {...limitOffset} />}
            {onCreate && (
              <Button
                startIcon={<Add />}
                onClick={() => {
                  onCreate();
                }}
              >
                Create
              </Button>
            )}
          </Select>
        );
      }}
      pending={() => <Loading />}
      initialized={() => <Loading />}
    />
  );
};
