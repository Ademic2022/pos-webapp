import { Users, BarChart3, FileText, CreditCard } from "lucide-react";

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  route: string;
}

export const cardsData: DashboardCard[] = [
  {
    id: "customer-management",
    title: "Customer Management",
    description:
      "View customer profiles, payment history, and outstanding debts",
    icon: <Users className="w-6 h-6 text-white" />,
    gradientFrom: "from-blue-500",
    gradientTo: "to-cyan-600",
    textColor: "text-blue-600",
    route: "/customers",
  },
  {
    id: "sales-reports",
    title: "Sales Reports",
    description: "View daily, weekly, and monthly sales analytics and trends",
    icon: <BarChart3 className="w-6 h-6 text-white" />,
    gradientFrom: "from-green-500",
    gradientTo: "to-emerald-600",
    textColor: "text-green-600",
    route: "/reports",
  },
  {
    id: "transaction-history",
    title: "Transaction History",
    description: "Review all past transactions and generate receipts",
    icon: <FileText className="w-6 h-6 text-white" />,
    gradientFrom: "from-purple-500",
    gradientTo: "to-indigo-600",
    textColor: "text-purple-600",
    route: "/transactions",
  },
  {
    id: "debt-management",
    title: "Debt Management",
    description: "Track and manage customer debts and payment schedules",
    icon: <CreditCard className="w-6 h-6 text-white" />,
    gradientFrom: "from-red-500",
    gradientTo: "to-pink-600",
    textColor: "text-red-600",
    route: "/debts",
  },
];
