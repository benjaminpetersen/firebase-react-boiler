import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import { IfAuthed } from "./containers/IfAuthed";
import { HeaderSidebar } from "./layout/HeaderSidebar";
import { AppRoutes } from "./router";
import { theme1 } from "./theme";
import { ThemeProvider } from "@mui/material";
import { DevelopmentContainer } from "./development-only/DevelopmentContainer";
import { GlobalWatchers } from "./containers/GlobalWatchers";
import { IfCompany } from "./containers/IfCompany";
import { AuthProvider } from "./containers/AuthProvider";

function App() {
  const theme = theme1;
  return (
    <AuthProvider>
      <DevelopmentContainer />
      <ThemeProvider theme={theme}>
        <Router>
          <GlobalWatchers>
            <IfAuthed>
              <IfCompany>
                <HeaderSidebar>
                  <AppRoutes />
                </HeaderSidebar>
              </IfCompany>
            </IfAuthed>
          </GlobalWatchers>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
