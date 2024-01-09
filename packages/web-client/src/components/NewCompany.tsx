import { Route, Routes } from "react-router";
import { HeaderSidebar } from "../layout/HeaderSidebar";
import { PrimaryCard } from "./PrimaryCard";
import { CreateCompanyContainer } from "../containers/CreateCompanyContainer";
import { SelectOrCreateCompany } from "./SelectOrCreateCompany";

export const NewCompany = () => {
  return (
    <HeaderSidebar noSidebar>
      <Routes>
        <Route
          path="/company/:id?"
          element={
            <PrimaryCard>
              <CreateCompanyContainer />
            </PrimaryCard>
          }
        />
        <Route path="/*" element={<SelectOrCreateCompany />} />
      </Routes>
    </HeaderSidebar>
  );
};
