// src/components/ProtectedRoute.jsx
import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const [isValid, setisValid] = useState(null);
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const API_URL = "https://erp-backend-drab.vercel.app/api/token/check";

  useEffect(() => {
    const checkTokenValidOrNot = async () => {
      if (!user || !user.token) {
        setisValid(false);
        return;
      }

      try {
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        // console.log({ response });

        if (response.data.success === false) {
          localStorage.clear();
          setisValid(false);
        } else {
          setisValid(true);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        localStorage.clear();
        setisValid(false);
      }
    };
    checkTokenValidOrNot();
  }, []);
  if (isValid === null) return null;
  if (!user || !isValid) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
