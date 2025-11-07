import { Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/adminPage/AdminPage";
import Signin from "./pages/authPage/Signin";
import Signup from "./pages/authPage/Signup";
import HomePage from "./pages/homePage/HomePage";
import ProtectedRoute from "./redux/auth/ProtectedRoute";
import UserPage from "./pages/userPage/UserPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="/user" element={<UserPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
