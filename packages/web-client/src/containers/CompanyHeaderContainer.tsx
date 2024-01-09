import { Typography } from "@mui/material";
import { setGlobalContext } from "../state/context";
import { useNavigate } from "react-router";

export const useNavToCreateCompany = () => {
  const nav = useNavigate();
  return () => {
    setGlobalContext({ companyId: undefined });
    nav("/company");
  };
};

export const CompanyHeaderContainer = () => {
  // TODO BPHERE
  return <Typography variant="h6"></Typography>;
};
