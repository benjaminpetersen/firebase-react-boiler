import React, { useRef, useState } from "react";
import { FileListItem } from "./FileListItem";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

type AddFilesProps = {
  files: File[];
  setFiles: (files: File[]) => void;
  uploadPercents?: (number | undefined)[];
  errors: (string | undefined)[];
  acceptedFiles: ".pdf"[];
  hideFileList?: boolean;
  children?: React.ReactNode;
  onDelete?: (f: File) => void;
  title?: React.ReactNode;
};

export const AddFiles: React.FC<AddFilesProps> = ({
  files: otherFiles,
  setFiles: setOtherFiles,
  uploadPercents,
  errors,
  children,
  acceptedFiles,
  hideFileList,
  onDelete,
  title,
}: AddFilesProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const setFiles = (files: File[]) => {
    setOtherFiles([...otherFiles, ...files]);
  };
  return (
    <Paper
      sx={{ p: 3, width: "100%" }}
      onClick={() => {
        inputRef.current?.click();
      }}
      onDrop={(e) => {
        const files = Array.from(e.dataTransfer?.files || []);
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        files.length && setFiles(files);
      }}
      onDragOver={(e) => {
        setDragOver(true);
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragLeave={() => {
        setDragOver(false);
      }}
    >
      <Grid container>
        <Grid item xs={12}>
          <Grid container>
            <input
              ref={inputRef}
              accept={acceptedFiles.join(", ")}
              style={{ display: "none" }}
              multiple
              type="file"
              onChange={(e) => {
                const files = e.target.files
                  ? Array.from(e.target.files)
                  : undefined;
                files && setFiles(files);
              }}
            />
            {children || (
              <Box
                sx={{
                  border: `4px dashed ${dragOver ? "green" : "grey"}`,
                  color: dragOver ? "green" : "inherit",
                  borderRadius: 1,
                  p: 3,
                  width: "100%",
                  height: "100%",
                }}
              >
                <Grid
                  container
                  spacing={3}
                  direction="column"
                  justifyContent={"space-around"}
                  alignItems={"center"}
                >
                  <Grid item>
                    {typeof title === "string" ||
                    typeof title === "undefined" ? (
                      <Typography variant="h5">
                        {title || "Add your files"}
                      </Typography>
                    ) : (
                      title
                    )}
                  </Grid>
                  <Grid item>
                    <CloudUpload
                      color="inherit"
                      sx={{ width: "50px", height: "50px" }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
        {!hideFileList && (
          <Grid item xs={12}>
            <Box pt={3}>
              <Grid container spacing={3}>
                {otherFiles.map((f, i) => {
                  const progress = uploadPercents?.[i];
                  const error = errors?.[i];
                  return (
                    <Grid item xs={12} key={i}>
                      <FileListItem
                        name={f.name}
                        progress={progress}
                        error={error}
                        onDelete={
                          onDelete && (!progress || progress === 100)
                            ? () => {
                                onDelete(f);
                              }
                            : undefined
                        }
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};
