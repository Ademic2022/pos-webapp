"use client";
import React from "react";
import Home from "@/components/home/home";
import { usePageLoading } from "@/hooks/usePageLoading";

const HomePage = () => {
  usePageLoading({
    text: "Loading dashboard",
    minDuration: 800,
  });

  return <Home />;
};

export default HomePage;
