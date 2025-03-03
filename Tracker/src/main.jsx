import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Login from "./Routes/Login";
import ForgotPassword from "./Routes/ForgotPassword";
import ChangePassword from "./Routes/ChangePassword";
import Dashboard from "./Routes/Dashboard";
import AddRecords from "./Routes/AddRecords";
import ManageRecord from "./Routes/ManageRecord";
import CreateAccount from "./Routes/CreateAccount";
import Settings from "./Routes/Settings";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/add-records" element={<AddRecords/>} />
        <Route path="/manage-records" element={<ManageRecord/>} />
        <Route path="/create-account" element={<CreateAccount/>} />
        <Route path="/settings" element={<Settings/>} />
      </Routes>
    </Router>
  </StrictMode>
);
