import { AddCircleOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { FallbackGhostTypography } from "./FallbackGhostTypography";
import { ScrollContainer } from "./ScrollContainer";
import { DeleteConfirm } from "./ConfirmComponent";
import { PlusIcon } from "./PlusIcon";

export type AvatarTableRowProps = {
  avatar: React.ReactNode;
  endContent?: React.ReactNode;
  onDelete?: () => void;
  main: React.ReactNode;
  additionalCells?: React.ReactNode;
};

export type SimpleAvatarListProps = {
  title: string;
  tableRows: AvatarTableRowProps[];
  onCreate?: () => void;
  topRight?: React.ReactNode;
  tableHeader?: {
    additionalCellHeaders?: React.ReactNode;
    avatarHeader?: React.ReactNode;
    mainHeader?: React.ReactNode;
    deleteHeader?: React.ReactNode;
  };
  bottom?: React.ReactNode;
};

export const SimpleAvatarList = ({
  onCreate,
  tableRows,
  title,
  tableHeader,
  topRight,
  bottom,
}: SimpleAvatarListProps) => {
  return (
    <ScrollContainer
      top={
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
          <Box>
            {onCreate && (
              <PlusIcon
                onClick={() => {
                  onCreate();
                }}
              />
            )}
            {topRight}
          </Box>
        </Box>
      }
      bottom={bottom}
    >
      {tableRows.length ? (
        <Table>
          {tableHeader && (
            <TableHead>
              <TableRow>
                <TableCell>{tableHeader.avatarHeader}</TableCell>
                <TableCell align="left">{tableHeader.mainHeader}</TableCell>
                {tableHeader.additionalCellHeaders}
                <TableCell align="right">{tableHeader.deleteHeader}</TableCell>
              </TableRow>
            </TableHead>
          )}
          <TableBody sx={{ overflow: "scroll", height: "100px" }}>
            {tableRows.map(
              (
                {
                  avatar,
                  main,
                  additionalCells: additionalListContent,
                  endContent,
                  onDelete,
                },
                i,
              ) => (
                <TableRow
                  key={i}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell width="50px">{avatar}</TableCell>
                  <TableCell align="left">
                    {typeof main === "string" ? (
                      <FallbackGhostTypography fallbackText="No Name">
                        {main}
                      </FallbackGhostTypography>
                    ) : (
                      main
                    )}
                  </TableCell>
                  {additionalListContent}
                  <TableCell align="right">
                    {endContent}{" "}
                    {onDelete && <DeleteConfirm onDelete={onDelete} />}
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      ) : onCreate ? (
        <Button
          onClick={() => {
            onCreate();
          }}
          startIcon={<AddCircleOutlined />}
        >
          Add
        </Button>
      ) : (
        "No rows to show"
      )}
    </ScrollContainer>
  );
};
