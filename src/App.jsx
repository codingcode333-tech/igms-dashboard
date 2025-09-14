import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth, Error } from "@/layouts";
import { SignIn, UpdatePassword } from "./pages/auth";
import PrivateRoute from "./PrivateRoute";
import { useState, useContext } from "react";
import { UserContext, getUser } from "@/context/UserContext";
import { ThemeProvider } from "@/context";

// Import error monitoring for debugging
import "@/utils/errorMonitor";

function App() {
  // const [user, setUser] = useContext(UserContext);
  const user = getUser()

  return (
    <ThemeProvider>
      <Routes >
        <Route exact path="/sign-in" element={user ? <Navigate to="dashboard/home" replace /> : <SignIn />} />

        <Route exact path="dashboard/*" element={user ? <Dashboard /> : <Navigate to="/sign-in" replace />} />
        <Route exact path="auth/*" element={user ? <Auth /> : <Navigate to="/sign-in" replace />} />
        <Route exact path="/change-password" element={user ? <UpdatePassword /> : <Navigate to="/sign-in" replace />} />
        <Route exact path="*" element={<Navigate to="dashboard/home" replace />} />
        {/* <Route  element={<Error />} /> */}
      </Routes>
    </ThemeProvider>
  );
}

export default App;
