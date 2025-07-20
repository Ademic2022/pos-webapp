// Filter preset management for reports
import { ReportFilters } from "@/interfaces/interface";

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: ReportFilters;
  createdAt: Date;
  isDefault?: boolean;
  tags?: string[];
}

export class FilterPresetManager {
  private static readonly STORAGE_KEY = 'reportsFilterPresets';
  private static readonly MAX_PRESETS = 20;

  static getDefaultPresets(): FilterPreset[] {
    return [
      {
        id: 'today-cash',
        name: 'Today - Cash Only',
        description: 'Today\'s cash transactions',
        filters: {
          dateRange: 'today',
          paymentMethod: 'cash',
          customerType: 'all',
          status: 'all',
          startDate: '',
          endDate: '',
          amountMin: undefined,
          amountMax: undefined,
          customerId: '',
          sortBy: 'date',
          sortDirection: 'desc'
        },
        createdAt: new Date(),
        isDefault: true,
        tags: ['quick', 'cash', 'today']
      },
      {
        id: 'week-wholesale',
        name: 'This Week - Wholesale',
        description: 'This week\'s wholesale transactions',
        filters: {
          dateRange: 'week',
          paymentMethod: 'all',
          customerType: 'wholesale',
          status: 'all',
          startDate: '',
          endDate: '',
          amountMin: undefined,
          amountMax: undefined,
          customerId: '',
          sortBy: 'amount',
          sortDirection: 'desc'
        },
        createdAt: new Date(),
        isDefault: true,
        tags: ['wholesale', 'week']
      },
      {
        id: 'pending-payments',
        name: 'Pending Payments',
        description: 'All transactions with pending payments',
        filters: {
          dateRange: 'month',
          paymentMethod: 'all',
          customerType: 'all',
          status: 'pending',
          startDate: '',
          endDate: '',
          amountMin: undefined,
          amountMax: undefined,
          customerId: '',
          sortBy: 'date',
          sortDirection: 'desc'
        },
        createdAt: new Date(),
        isDefault: true,
        tags: ['pending', 'payments']
      },
      {
        id: 'high-value',
        name: 'High Value Transactions',
        description: 'Transactions over $1000',
        filters: {
          dateRange: 'month',
          paymentMethod: 'all',
          customerType: 'all',
          status: 'all',
          startDate: '',
          endDate: '',
          amountMin: 1000,
          amountMax: undefined,
          customerId: '',
          sortBy: 'amount',
          sortDirection: 'desc'
        },
        createdAt: new Date(),
        isDefault: true,
        tags: ['high-value', 'amount']
      }
    ];
  }

  static loadPresets(): FilterPreset[] {
    try {
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        return this.getDefaultPresets();
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        const defaults = this.getDefaultPresets();
        this.savePresets(defaults);
        return defaults;
      }

      const presets = JSON.parse(stored).map((preset: Partial<FilterPreset> & { createdAt: string }) => ({
        ...preset,
        createdAt: new Date(preset.createdAt)
      })) as FilterPreset[];

      // Ensure default presets exist
      const defaultPresets = this.getDefaultPresets();
      const merged = this.mergeWithDefaults(presets, defaultPresets);

      return merged;
    } catch (error) {
      console.warn('Failed to load filter presets:', error);
      return this.getDefaultPresets();
    }
  }

  static savePresets(presets: FilterPreset[]): void {
    try {
      // Limit number of presets
      const limited = presets.slice(0, this.MAX_PRESETS);

      // Only access localStorage on client side
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limited));
      }
    } catch (error) {
      console.warn('Failed to save filter presets:', error);
    }
  }

  static savePreset(preset: Omit<FilterPreset, 'id' | 'createdAt'>): FilterPreset {
    const newPreset: FilterPreset = {
      ...preset,
      id: this.generateId(),
      createdAt: new Date()
    };

    const presets = this.loadPresets();
    const updated = [newPreset, ...presets.filter(p => !p.isDefault)];

    this.savePresets(updated);
    return newPreset;
  }

  static updatePreset(id: string, updates: Partial<FilterPreset>): FilterPreset | null {
    const presets = this.loadPresets();
    const index = presets.findIndex(p => p.id === id);

    if (index === -1) return null;

    const updated = { ...presets[index], ...updates };
    presets[index] = updated;

    this.savePresets(presets);
    return updated;
  }

  static deletePreset(id: string): boolean {
    const presets = this.loadPresets();
    const preset = presets.find(p => p.id === id);

    // Don't delete default presets
    if (preset?.isDefault) return false;

    const filtered = presets.filter(p => p.id !== id);
    this.savePresets(filtered);
    return true;
  }

  static duplicatePreset(id: string, newName?: string): FilterPreset | null {
    const presets = this.loadPresets();
    const original = presets.find(p => p.id === id);

    if (!original) return null;

    return this.savePreset({
      name: newName || `${original.name} (Copy)`,
      description: original.description,
      filters: { ...original.filters },
      tags: original.tags ? [...original.tags] : undefined
    });
  }

  static searchPresets(query: string, presets?: FilterPreset[]): FilterPreset[] {
    const allPresets = presets || this.loadPresets();
    const lowerQuery = query.toLowerCase();

    return allPresets.filter(preset =>
      preset.name.toLowerCase().includes(lowerQuery) ||
      preset.description?.toLowerCase().includes(lowerQuery) ||
      preset.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  static getPresetsByTag(tag: string): FilterPreset[] {
    const presets = this.loadPresets();
    return presets.filter(preset =>
      preset.tags?.includes(tag.toLowerCase())
    );
  }

  static validatePreset(preset: Partial<FilterPreset>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!preset.name || preset.name.trim().length === 0) {
      errors.push('Preset name is required');
    }

    if (preset.name && preset.name.length > 50) {
      errors.push('Preset name must be 50 characters or less');
    }

    if (preset.description && preset.description.length > 200) {
      errors.push('Description must be 200 characters or less');
    }

    if (!preset.filters) {
      errors.push('Filter configuration is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static exportPresets(): string {
    const presets = this.loadPresets().filter(p => !p.isDefault);
    return JSON.stringify(presets, null, 2);
  }

  static importPresets(data: string): {
    success: boolean;
    imported: number;
    errors: string[];
  } {
    try {
      const imported = JSON.parse(data) as FilterPreset[];
      const errors: string[] = [];
      let importedCount = 0;

      const existingPresets = this.loadPresets();

      for (const preset of imported) {
        const validation = this.validatePreset(preset);
        if (!validation.isValid) {
          errors.push(`Invalid preset "${preset.name}": ${validation.errors.join(', ')}`);
          continue;
        }

        // Check for name conflicts
        const nameExists = existingPresets.some(p => p.name === preset.name);
        if (nameExists) {
          errors.push(`Preset with name "${preset.name}" already exists`);
          continue;
        }

        this.savePreset({
          name: preset.name,
          description: preset.description,
          filters: preset.filters,
          tags: preset.tags
        });

        importedCount++;
      }

      return {
        success: importedCount > 0,
        imported: importedCount,
        errors
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: ['Failed to parse import data: ' + (error instanceof Error ? error.message : 'Unknown error')]
      };
    }
  }

  private static generateId(): string {
    return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static mergeWithDefaults(stored: FilterPreset[], defaults: FilterPreset[]): FilterPreset[] {
    const userPresets = stored.filter(p => !p.isDefault);
    return [...defaults, ...userPresets];
  }
}

// Hook for managing filter presets
import { useState, useEffect } from 'react';

export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const loadedPresets = FilterPresetManager.loadPresets();
    setPresets(loadedPresets);
    setIsLoading(false);
  }, []);

  const savePreset = (preset: Omit<FilterPreset, 'id' | 'createdAt'>) => {
    const newPreset = FilterPresetManager.savePreset(preset);
    setPresets(prev => [newPreset, ...prev.filter(p => !p.isDefault)]);
    return newPreset;
  };

  const updatePreset = (id: string, updates: Partial<FilterPreset>) => {
    const updated = FilterPresetManager.updatePreset(id, updates);
    if (updated) {
      setPresets(prev => prev.map(p => p.id === id ? updated : p));
    }
    return updated;
  };

  const deletePreset = (id: string) => {
    const success = FilterPresetManager.deletePreset(id);
    if (success) {
      setPresets(prev => prev.filter(p => p.id !== id));
    }
    return success;
  };

  const duplicatePreset = (id: string, newName?: string) => {
    const duplicate = FilterPresetManager.duplicatePreset(id, newName);
    if (duplicate) {
      setPresets(prev => [duplicate, ...prev]);
    }
    return duplicate;
  };

  const searchPresets = (query: string) => {
    return FilterPresetManager.searchPresets(query, presets);
  };

  const getPresetsByTag = (tag: string) => {
    return FilterPresetManager.getPresetsByTag(tag);
  };

  return {
    presets,
    isLoading,
    savePreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    searchPresets,
    getPresetsByTag,
    refreshPresets: () => {
      const loadedPresets = FilterPresetManager.loadPresets();
      setPresets(loadedPresets);
    }
  };
}
