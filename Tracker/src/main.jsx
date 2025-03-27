import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Login from "./Routes/Login";
import ForgotPassword from "./Routes/ForgotPassword";
import ChangePassword from "./Routes/ChangePassword";
import Dashboard from "./Routes/Dashboard";
import AddRecords from "./Routes/AddRecords";
import Request from "./Routes/Request";
import History from "./Routes/History";
import CommitteeManage from "./Routes/CommitteeManage";
import ManageAccount from "./Routes/ManageAccount";
import Settings from "./Routes/Settings";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/add-records" element={<AddRecords/>} />
        <Route path="/request" element={<Request/>} />
        <Route path="/history" element={<History/>} />
        <Route path="/committee-management" element={<CommitteeManage/>} />
        <Route path="/manage-account" element={<ManageAccount/>} />
        <Route path="/settings" element={<Settings/>} />
      </Routes>
    </Router>
  </StrictMode>
);
