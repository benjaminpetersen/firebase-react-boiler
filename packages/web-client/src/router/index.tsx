import { Route, Routes } from "react-router-dom";
import Dashboard from "../components/Dashboard";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/*" element={<Dashboard />} />
    </Routes>
  );
};
