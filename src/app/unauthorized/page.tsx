"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Access Denied
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          You don&apos;t have permission to access this page or perform this
          action.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              What can you do?
            </h2>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>• Contact your administrator to request access</li>
              <li>• Check if you&apos;re logged in with the correct account</li>
              <li>• Return to a page you have access to</li>
            </ul>

            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
