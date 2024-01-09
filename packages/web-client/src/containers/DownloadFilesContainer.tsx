import { DownloadFiles } from "../components/DownloadFiles";
import { PropsOf } from "../utils/propsOf";
import { AsyncButton } from "../components/AsyncButton";

const dl = async (f: File) => {
  const a = document.createElement("a");
  a.style.display = "none";
  const url = URL.createObjectURL(f);
  a.href = url;
  a.download = f.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  a.remove();
  URL.revokeObjectURL(url);
};

export const DownloadFilesContainer = ({
  files,
  ...btnProps
}: { files: File[] } & Omit<PropsOf<typeof AsyncButton>, "onClick">) => {
  return (
    <DownloadFiles
      onClick={async () => {
        await Promise.all(files.map(dl)).catch();
      }}
      {...btnProps}
    />
  );
};
