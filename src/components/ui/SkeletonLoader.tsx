"use client";
import React from "react";
import { SkeletonLoaderProps } from "@/interfaces/interface";

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  rows = 5,
  columns = 4,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Header Skeleton */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div
            key={`header-${index}`}
            className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"
          />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4 py-3 border-b border-gray-100"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse"
              style={{
                animationDelay: `${(rowIndex * columns + colIndex) * 100}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
