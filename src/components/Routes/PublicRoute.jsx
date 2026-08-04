import React from "react";
import { useAuthStore } from "../../lib/api/store/authStore";
import { Navigate } from "react-router";

export const PublicRoute = ({ children }) => {
  const { token } = useAuthStore();
  

  if (token) {
    return <Navigate to="/dashboard" replace={true} />
  
  }

  return children;
};

export default PublicRoute;