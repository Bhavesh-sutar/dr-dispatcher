import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// import { useAuth } from "./context/AuthContext";
//temporary dispatcher page for testing
import ProtectedRoute from "./components/ProtectedRoute";
import DRDispatcher from "./pages/DRDispatcher";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dr-dispatcher"
          element={
            <ProtectedRoute>
              <DRDispatcher />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;