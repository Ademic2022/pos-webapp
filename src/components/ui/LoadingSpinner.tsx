"use client";
import React from "react";
import { Droplets } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  variant?: "primary" | "secondary";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text = "Loading...",
  fullScreen = false,
  variant = "primary",
}) => {
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center z-50"
    : "flex items-center justify-center p-4";

  const colorClasses =
    variant === "primary" ? "text-orange-600" : "text-gray-600";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <Droplets className="w-8 h-8 text-white animate-pulse" />
          </div>
          {/* Rotating ring */}
          <div className="absolute inset-0 border-4 border-orange-200 border-t-orange-500 rounded-xl animate-spin"></div>
        </div>

        {/* Loading text with animated dots */}
        <div className="flex items-center space-x-2">
          <span
            className={`${textSizeClasses[size]} font-medium ${colorClasses}`}
          >
            {text}
          </span>
          <div className="flex space-x-1">
            <div
              className={`w-1 h-1 bg-orange-500 rounded-full animate-bounce`}
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className={`w-1 h-1 bg-orange-500 rounded-full animate-bounce`}
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className={`w-1 h-1 bg-orange-500 rounded-full animate-bounce`}
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>

        {/* Progress bar */}
        {fullScreen && (
          <div className="w-64 h-2 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-600 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
