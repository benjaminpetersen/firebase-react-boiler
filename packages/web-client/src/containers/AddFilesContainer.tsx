import React from "react";
import { AddFiles } from "../components/AddFiles";
import { uploadFile } from "../network/firebase/files";
import { difference } from "lodash-es";
import { PropsOf } from "../utils/propsOf";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { AppErr } from "../domains/errors";

type NumMap = Map<File, number>;
type StrMap = Map<File, string>;
export type FileAndUri = { file: File; gsUri: string };

export const AddFilesContainer = (props: {
  onUpload: (f: FileAndUri) => void;
  onDelete?: (gsUri: string) => void;
  progress?: NumMap;
  setProgress?: (p: NumMap) => void;
  errors?: StrMap;
  setErrors?: (e: StrMap) => void;
  // DI for renaming the files with a count appended.
  fullPath: (fileName: string) => Promise<E.Either<AppErr, string>>;
  addFilesProps?: Partial<PropsOf<typeof AddFiles>>;
  acceptedFiles: PropsOf<typeof AddFiles>["acceptedFiles"];
}) => {
  // URI's must come from props.files or onUpload
  const gsUris = React.useRef<Map<File, string>>(new Map());
  const [files, setFiles] = React.useState<File[]>([]);
  const [_progress, _setProgress] = React.useState<Map<File, number>>(
    props.progress || new Map(),
  );
  const progress = props.progress || _progress;
  const setProgress = props.setProgress || _setProgress;
  const [_errors, _setErrors] = React.useState<Map<File, string>>(
    props.errors || new Map(),
  );
  const errors = props.errors || _errors;
  const setErrors = props.setErrors || _setErrors;

  return (
    <AddFiles
      onDelete={
        props.onDelete
          ? (f) => {
              const deletedUri = gsUris.current.get(f);
              setFiles((fs) => fs.filter((file) => file !== f));
              deletedUri && props.onDelete?.(deletedUri);
            }
          : undefined
      }
      acceptedFiles={props.acceptedFiles}
      uploadPercents={files.map((f) => progress.get(f))}
      files={files}
      errors={files.map((f) => errors.get(f))}
      setFiles={(newFiles) => {
        const filesToUpload = difference(newFiles, files);
        setFiles(newFiles);
        filesToUpload.forEach(async (file) => {
          // Get a unique name, start a firebase progress tracking record, then
          pipe(
            await props.fullPath(file.name),
            E.foldW(
              () => {
                setErrors(new Map(errors.set(file, "Failed to name the file")));
              },
              async (fullPath) => {
                setProgress(new Map(progress.set(file, 0)));
                const upload = await uploadFile({
                  file,
                  fullPath: fullPath,
                });
                upload.onProgress((percent) => {
                  return setProgress(new Map(progress.set(file, percent)));
                });
                upload.onError((err) => {
                  setErrors(
                    new Map(
                      errors.set(
                        file,
                        err.msg || "Something went wrong while uploading",
                      ),
                    ),
                  );
                });
                upload.onComplete((gsUri) => {
                  gsUris.current.set(file, gsUri);
                  props.onUpload({ file, gsUri });
                });
              },
            ),
          );
        });
      }}
      {...props.addFilesProps}
    />
  );
};
