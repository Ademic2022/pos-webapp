"use client";
import React from "react";
import NewSalePage from "@/components/sale/newSale";
import { usePageLoading } from "@/hooks/usePageLoading";

const SalesPage = () => {
  usePageLoading({
    text: "Loading sales interface",
    minDuration: 700,
  });

  return <NewSalePage />;
};

export default SalesPage;
