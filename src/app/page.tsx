"use client";
import React from "react";
import Home from "@/components/home/home";
import { usePageLoading } from "@/hooks/usePageLoading";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const HomePage = () => {
  usePageLoading({
    text: "Loading dashboard",
    minDuration: 800,
  });

  return (
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  );
};

export default HomePage;
