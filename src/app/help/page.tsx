"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Search,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HelpPage: React.FC = () => {
  const faqItems = [
    {
      question: "How do I process a return?",
      answer:
        "Navigate to the Returns section and follow the step-by-step process to handle customer returns.",
    },
    {
      question: "How can I check my inventory levels?",
      answer:
        "Go to Stock management to view current inventory levels and set low stock alerts.",
    },
    {
      question: "How do I generate sales reports?",
      answer:
        "Visit the Reports section to generate detailed sales analytics and download reports.",
    },
    {
      question: "How do I add new customers?",
      answer:
        'In the Customers section, click "Add Customer" to create new customer profiles.',
    },
    {
      question: "How do I track customer credit/debt?",
      answer:
        "Customer credit and debt tracking is automatically handled in the sales and customer management system.",
    },
  ];

  const supportOptions = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      contact: "+1 (555) 123-4567",
      availability: "Mon-Fri, 9AM-6PM",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      contact: "support@pos-system.com",
      availability: "Response within 24 hours",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team",
      contact: "Available in-app",
      availability: "Mon-Fri, 9AM-6PM",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.header
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/">
                  <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-orange-600" />
                  </button>
                </Link>
              </motion.div>
              <motion.div
                className="flex items-center space-x-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.div
                  className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    delay: 2,
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                >
                  <HelpCircle className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Help & Support
                  </h1>
                  <p className="text-xs text-orange-600">Get Help & Support</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {/* Support Options */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {supportOptions.map((option, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg border border-orange-100"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              whileHover={{
                scale: 1.05,
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.25)",
              }}
            >
              <motion.div
                className="flex items-center space-x-3 mb-4"
                whileHover={{ x: 5 }}
              >
                <motion.div
                  className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                >
                  <option.icon className="w-5 h-5 text-orange-600" />
                </motion.div>
                <h3 className="font-semibold text-gray-900">{option.title}</h3>
              </motion.div>
              <p className="text-gray-600 text-sm mb-3">{option.description}</p>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{option.contact}</p>
                <p className="text-xs text-gray-500">{option.availability}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          whileHover={{
            y: -2,
            boxShadow: "0 25px 50px -12px rgba(251, 146, 60, 0.15)",
          }}
        >
          <motion.div
            className="p-6 border-b border-gray-200"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>
          </motion.div>
          <div className="p-6">
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default HelpPage;
