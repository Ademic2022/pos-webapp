import { InventoryCardProps } from "@/interfaces/interface";

export function InventoryCard({
  value,
  unit,
  icon: Icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
  footerText,
  layout = "horizontal",
}: InventoryCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
      <div
        className={`flex items-center justify-between ${
          layout === "horizontal" ? "mb-4" : ""
        }`}
      >
        {Icon && (
          <div
            className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
        <div className={`${layout === "horizontal" ? "text-right" : ""}`}>
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-gray-600">{unit}</div>
        </div>
      </div>
      {footerText && (
        <div className="text-xs text-gray-500 mt-2">{footerText}</div>
      )}
    </div>
  );
}
