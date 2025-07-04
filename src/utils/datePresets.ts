// Date preset utilities for the reports page
export interface DatePreset {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
  description?: string;
}

export class DatePresetUtils {
  static getToday(): DatePreset {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    return {
      label: "Today",
      value: "today",
      startDate: today,
      endDate: endOfDay,
      description: "Today's transactions"
    };
  }

  static getYesterday(): DatePreset {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endOfDay = new Date(yesterday);
    endOfDay.setHours(23, 59, 59, 999);
    
    return {
      label: "Yesterday",
      value: "yesterday",
      startDate: yesterday,
      endDate: endOfDay,
      description: "Yesterday's transactions"
    };
  }

  static getLastWeek(): DatePreset {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    lastWeek.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);
    
    return {
      label: "Last 7 Days",
      value: "last7days",
      startDate: lastWeek,
      endDate: today,
      description: "Transactions from the last 7 days"
    };
  }

  static getLastMonth(): DatePreset {
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    lastMonth.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);
    
    return {
      label: "Last 30 Days",
      value: "last30days",
      startDate: lastMonth,
      endDate: today,
      description: "Transactions from the last 30 days"
    };
  }

  static getThisWeek(): DatePreset {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const difference = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start of week
    startOfWeek.setDate(today.getDate() - difference);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return {
      label: "This Week",
      value: "thisweek",
      startDate: startOfWeek,
      endDate: endOfWeek,
      description: "Monday to Sunday of current week"
    };
  }

  static getThisMonth(): DatePreset {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    return {
      label: "This Month",
      value: "thismonth",
      startDate: startOfMonth,
      endDate: endOfMonth,
      description: "Current month's transactions"
    };
  }

  static getThisQuarter(): DatePreset {
    const today = new Date();
    const quarter = Math.floor(today.getMonth() / 3);
    const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
    startOfQuarter.setHours(0, 0, 0, 0);
    
    const endOfQuarter = new Date(today.getFullYear(), quarter * 3 + 3, 0);
    endOfQuarter.setHours(23, 59, 59, 999);
    
    return {
      label: "This Quarter",
      value: "thisquarter",
      startDate: startOfQuarter,
      endDate: endOfQuarter,
      description: "Current quarter's transactions"
    };
  }

  static getThisYear(): DatePreset {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    endOfYear.setHours(23, 59, 59, 999);
    
    return {
      label: "This Year",
      value: "thisyear",
      startDate: startOfYear,
      endDate: endOfYear,
      description: "Current year's transactions"
    };
  }

  static getAllPresets(): DatePreset[] {
    return [
      this.getToday(),
      this.getYesterday(),
      this.getLastWeek(),
      this.getLastMonth(),
      this.getThisWeek(),
      this.getThisMonth(),
      this.getThisQuarter(),
      this.getThisYear(),
    ];
  }

  static getPresetByValue(value: string): DatePreset | null {
    const presets = this.getAllPresets();
    return presets.find(preset => preset.value === value) || null;
  }

  static formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static formatDateRange(startDate: Date, endDate: Date): string {
    const start = startDate.toLocaleDateString();
    const end = endDate.toLocaleDateString();
    
    if (start === end) {
      return start;
    }
    
    return `${start} - ${end}`;
  }
}
