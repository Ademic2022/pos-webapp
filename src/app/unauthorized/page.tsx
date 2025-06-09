"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
        >
          <motion.div
            className="rounded-full bg-red-100 p-3"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{
              delay: 1,
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <Shield className="h-8 w-8 text-red-600" />
          </motion.div>
        </motion.div>
        <motion.h1
          className="mt-6 text-center text-3xl font-extrabold text-gray-900"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Access Denied
        </motion.h1>
        <motion.p
          className="mt-2 text-center text-sm text-gray-600"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          You don&apos;t have permission to access this page or perform this
          action.
        </motion.p>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.div
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          whileHover={{
            y: -5,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div className="text-center">
            <motion.h2
              className="text-lg font-medium text-gray-900 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              What can you do?
            </motion.h2>
            <motion.ul
              className="text-sm text-gray-600 space-y-2 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <motion.li
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.3 }}
              >
                • Contact your administrator to request access
              </motion.li>
              <motion.li
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.3 }}
              >
                • Check if you&apos;re logged in with the correct account
              </motion.li>
              <motion.li
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.3 }}
              >
                • Return to a page you have access to
              </motion.li>
            </motion.ul>

            <motion.div
              className="space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <motion.button
                onClick={() => router.back()}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </motion.button>

              <motion.button
                onClick={() => router.push("/")}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Dashboard
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
