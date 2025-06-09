import { StatsCardProps } from "@/interfaces/interface";

export function StatsCard({
  title,
  titleColor,
  cardBg,
  value,
  change,
  icon: Icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
  borderColor = "border-orange-100",
}: StatsCardProps) {
  return (
    <div
      className={`${
        cardBg || "bg-white"
      } rounded-xl p-6 shadow-lg border ${borderColor}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${titleColor || "text-gray-600"} mb-1"`}>
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={`text-sm ${
                change.textColor || "text-blue-600"
              } flex items-center`}
            >
              {change.icon && <change.icon className="w-4 h-4 mr-1" />}
              {change.value}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
}
