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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <HelpCircle className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          </div>
          <p className="text-gray-600">
            Get help with using your POS system and find answers to common
            questions
          </p>
        </div>

        <div className="space-y-8">
          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Search Help Articles
            </h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-gray-500">
                Find quick answers to common questions
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {faqItems.map((item, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {item.question}
                      </h3>
                      <p className="text-sm text-gray-600">{item.answer}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Contact Support
              </h2>
              <p className="text-sm text-gray-500">
                Get in touch with our support team
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {supportOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={index}
                      className="text-center p-6 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                        <Icon className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {option.description}
                      </p>
                      <p className="text-sm font-medium text-orange-600 mb-1">
                        {option.contact}
                      </p>
                      <p className="text-xs text-gray-500">
                        {option.availability}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Links</h2>
              <p className="text-sm text-gray-500">
                Jump to important sections
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/returns"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Returns System Guide
                    </p>
                    <p className="text-sm text-gray-500">
                      Learn how to handle returns
                    </p>
                  </div>
                </Link>
                <Link
                  href="/inventory/settings"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Inventory Management
                    </p>
                    <p className="text-sm text-gray-500">
                      Manage your stock levels
                    </p>
                  </div>
                </Link>
                <Link
                  href="/sales"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Sales Management
                    </p>
                    <p className="text-sm text-gray-500">
                      Process sales and payments
                    </p>
                  </div>
                </Link>
                <Link
                  href="/customers"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Customer Management
                    </p>
                    <p className="text-sm text-gray-500">
                      Manage customer accounts
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
