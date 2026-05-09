import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import Clients from "./pages/Clients/Clients";
import ClientForm from "./pages/ClientForm/ClientForm";
import ClientDetail from "./pages/ClientDetail/ClientDetail";
import ReportEntry from "./pages/ReportEntry/ReportEntry";
import ReportPreview from "./pages/ReportPreview/ReportPreview";
import Reports from "./pages/Reports/Reports";
import "./index.css";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/new" element={<ClientForm />} />
              <Route path="/clients/:id/edit" element={<ClientForm />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/clients/:clientId/report/new" element={<ReportEntry />} />
              <Route path="/clients/:clientId/report/:reportId" element={<ReportPreview />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
