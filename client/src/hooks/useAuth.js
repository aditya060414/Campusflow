import { useContext } from "react";
import { AuthContext } from "../context/ThemeContext"; // Wait, it's AuthContext, imported from AuthContext.jsx
import { AuthContext as ActualAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(ActualAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
