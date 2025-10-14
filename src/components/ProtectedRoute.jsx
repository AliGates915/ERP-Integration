// src/components/ProtectedRoute.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const [isValid, setIsValid] = useState(null);
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const API_URL = "https://erp-backend-drab.vercel.app/api/token/check";

  useEffect(() => {
    const checkToken = async () => {
      if (!user?.token) {
        setIsValid(false);
        return;
      }

      // ⏳ Use cached result if validated recently (within 5 minutes)
      const lastCheck = localStorage.getItem("lastTokenCheck");
      if (lastCheck && Date.now() - parseInt(lastCheck, 10) < 5 * 60 * 1000) {
        setIsValid(true);
        return;
      }

      try {
        const { data } = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${user.token}` },
          timeout: 7000, // avoid hanging forever
        });

        if (data?.success === false) {
          // ❌ Explicitly invalid token
          localStorage.clear();
          setIsValid(false);
        } else {
          // ✅ Valid token
          localStorage.setItem("lastTokenCheck", Date.now().toString());
          setIsValid(true);
        }
      } catch (error) {
        console.warn("⚠️ Token validation failed:", error.message);
        // ✅ Network / server failure — keep session active instead of logging out
        setIsValid(true);
      }
    };

    checkToken();
  }, []);

  // ⏳ While checking
   if (isValid === null) return null;

  // 🔒 If no user or invalid token
  if (!user || !isValid) return <Navigate to="/" replace />;

  // 🔑 Role-based access check
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
