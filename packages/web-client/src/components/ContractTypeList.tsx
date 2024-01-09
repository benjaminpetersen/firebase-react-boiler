import { PropsOf } from "../utils/propsOf";
import { AvatarTableRowProps, SimpleAvatarList } from "./SimpleAvatarList";
import { DocumentScannerOutlined } from "@mui/icons-material";
export const ContractTypeList = ({
  listitems,
  onCreate,
  ...props
}: {
  listitems: Omit<AvatarTableRowProps, "avatar">[];
  onCreate: () => void;
} & Partial<PropsOf<typeof SimpleAvatarList>>) => {
  return (
    <SimpleAvatarList
      onCreate={onCreate}
      title="Contract Types"
      tableRows={listitems.map((li) => ({
        ...li,
        avatar: <DocumentScannerOutlined />,
      }))}
      {...props}
    />
  );
};
