"use client";
import React from "react";
import NewSalePage from "@/components/sale/newSale";
import { usePageLoading } from "@/hooks/usePageLoading";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const SalesPage = () => {
  usePageLoading({
    text: "Loading sales interface",
    minDuration: 700,
  });

  return (
    <ProtectedRoute requiredPermission="NEW_SALE">
      <NewSalePage />
    </ProtectedRoute>
  );
};

export default SalesPage;
