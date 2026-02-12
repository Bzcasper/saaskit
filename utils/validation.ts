// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * Input Validation Utilities
 * Comprehensive validation for API inputs and user data
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: any;
}

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
  sanitize?: (value: any) => any;
}

export class Validator {
  static validate(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = [];
    let sanitized = value;

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push('This field is required');
      return { isValid: false, errors };
    }

    // Skip other validations if value is empty and not required
    if (value === undefined || value === null || value === '') {
      return { isValid: true, errors: [], sanitized };
    }

    // Type validation
    if (rules.type) {
      const typeValid = this.validateType(value, rules.type);
      if (!typeValid) {
        errors.push(`Must be of type ${rules.type}`);
      }
    }

    // String validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Must be at least ${rules.minLength} characters long`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Must be no more than ${rules.maxLength} characters long`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push('Format is invalid');
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`Must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`Must be no more than ${rules.max}`);
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`Must be one of: ${rules.enum.join(', ')}`);
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value);
      if (customResult === false) {
        errors.push('Validation failed');
      } else if (typeof customResult === 'string') {
        errors.push(customResult);
      }
    }

    // Sanitization
    if (rules.sanitize && errors.length === 0) {
      sanitized = rules.sanitize(value);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized,
    };
  }

  static validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return false;
    }
  }

  static validateObject(obj: Record<string, any>, schema: Record<string, ValidationRule>): ValidationResult {
    const errors: string[] = [];
    const sanitized: Record<string, any> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const result = this.validate(obj[field], rules);

      if (!result.isValid) {
        errors.push(...result.errors.map(error => `${field}: ${error}`));
      } else if (result.sanitized !== undefined) {
        sanitized[field] = result.sanitized;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized,
    };
  }
}

// Common validation rules
export const ValidationRules = {
  email: {
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    sanitize: (value: string) => value.toLowerCase().trim(),
  },

  password: {
    type: 'string' as const,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },

  username: {
    type: 'string' as const,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
    sanitize: (value: string) => value.toLowerCase().trim(),
  },

  videoId: {
    type: 'string' as const,
    pattern: /^[a-zA-Z0-9_-]{11}$/,
  },

  limit: {
    type: 'number' as const,
    min: 1,
    max: 100,
  },

  offset: {
    type: 'number' as const,
    min: 0,
  },

  apiKeyName: {
    type: 'string' as const,
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9 _-]+$/,
    sanitize: (value: string) => value.trim(),
  },
};

// API-specific validation schemas
export const ValidationSchemas = {
  searchTracks: {
    q: { ...ValidationRules.videoId, required: true },
    limit: ValidationRules.limit,
    offset: ValidationRules.offset,
  },

  createAPIKey: {
    name: { ...ValidationRules.apiKeyName, required: true },
    permissions: {
      type: 'array' as const,
      required: true,
      custom: (value: any[]) => {
        const validPermissions = ['read:search', 'read:tracks', 'read:ai_analysis', 'read:recommendations', '*'];
        return value.every((p: string) => validPermissions.includes(p)) || 'Invalid permissions';
      },
    },
    rateLimitTier: {
      enum: ['free', 'premium', 'enterprise'],
      required: true,
    },
  },

  generatePlaylist: {
    theme: {
      type: 'string' as const,
      required: true,
      minLength: 1,
      maxLength: 50,
    },
    duration: {
      type: 'number' as const,
      required: true,
      min: 300, // 5 minutes
      max: 14400, // 4 hours
    },
    genres: {
      type: 'array' as const,
      maxLength: 10,
    },
    mood: {
      type: 'string' as const,
      enum: ['energetic', 'calm', 'happy', 'sad', 'romantic', 'focus'],
    },
  },
};

// Input sanitization utilities
export const Sanitizers = {
  trim: (value: string) => value.trim(),
  lowercase: (value: string) => value.toLowerCase(),
  removeHtml: (value: string) => value.replace(/<[^>]*>/g, ''),
  escapeSql: (value: string) => value.replace(/['";\\]/g, ''),
  limitLength: (maxLength: number) => (value: string) => value.substring(0, maxLength),
};

// Security validation
export const SecurityValidators = {
  noXSS: {
    custom: (value: string) => {
      const dangerous = ['<script', 'javascript:', 'onload=', 'onerror='];
      return !dangerous.some(d => value.toLowerCase().includes(d)) || 'Potentially dangerous content detected';
    },
  },

  noSQLInjection: {
    custom: (value: string) => {
      const dangerous = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'UNION', '--', '/*', '*/'];
      return !dangerous.some(d => value.toUpperCase().includes(d)) || 'Invalid characters detected';
    },
  },
};