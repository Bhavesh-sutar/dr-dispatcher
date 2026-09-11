import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AuthProvider } from "./context/AuthContext";
import NotificationProvider from "./context/NotificationContext";

import GlobalNotification from "./components/GlobalNotification/GlobalNotification";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.jsx";

// Create a root element for rendering the React application
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <GlobalNotification />
        <Toaster position="top-center" duration={5000} />
        <App />
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
);
