/**
 * Validation utility library for form fields and data objects
 */

/**
 * Base validation rules and error messages
 */
export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

/**
 * Standard validation rules library
 */
export const Rules = {
  required: (message = "This field is required"): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object") return Object.keys(value).length > 0;
      return true;
    },
    message,
  }),

  email: (message = "Please enter a valid email address"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(String(value).toLowerCase());
    },
    message,
  }),

  minLength: (
    min: number,
    message = `Must be at least ${min} characters`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields
      return String(value).length >= min;
    },
    message,
  }),

  maxLength: (
    max: number,
    message = `Must be no more than ${max} characters`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields
      return String(value).length <= max;
    },
    message,
  }),

  pattern: (regex: RegExp, message = "Invalid format"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields
      return regex.test(String(value));
    },
    message,
  }),

  numeric: (message = "Must be a valid number"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields
      return !isNaN(Number(value));
    },
    message,
  }),

  integer: (message = "Must be a whole number"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields
      return Number.isInteger(Number(value));
    },
    message,
  }),

  min: (min: number, message = `Must be at least ${min}`): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields
      return Number(value) >= min;
    },
    message,
  }),

  max: (
    max: number,
    message = `Must be no more than ${max}`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields
      return Number(value) <= max;
    },
    message,
  }),

  match: (field: string, message = "Fields do not match"): ValidationRule => ({
    validate: (value, formValues) => {
      if (!value) return true; // Let required rule handle empty fields
      return value === formValues[field];
    },
    message,
  }),

  strongPassword: (
    message = "Password must contain at least 8 characters, including uppercase, lowercase, and numbers"
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields
      const minLength = value.length >= 8;
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      return minLength && hasUppercase && hasLowercase && hasNumbers;
    },
    message,
  }),

  url: (message = "Please enter a valid URL"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields
      try {
        new URL(value);
        return true;
      } catch (e) {
        return false;
      }
    },
    message,
  }),

  date: (message = "Please enter a valid date"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields
      return !isNaN(Date.parse(value));
    },
    message,
  }),

  fileType: (
    types: string[],
    message = `Accepted file types: ${types.join(", ")}`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields

      // Handle file input element
      if (value instanceof HTMLInputElement && value.type === "file") {
        if (!value.files || value.files.length === 0) return true;
        const file = value.files[0];
        return types.some((type) => file.type.includes(type));
      }

      // Handle File object
      if (value instanceof File) {
        return types.some((type) => value.type.includes(type));
      }

      return true;
    },
    message,
  }),

  maxFileSize: (
    sizeInMB: number,
    message = `File must be smaller than ${sizeInMB}MB`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty fields

      // Handle file input element
      if (value instanceof HTMLInputElement && value.type === "file") {
        if (!value.files || value.files.length === 0) return true;
        const file = value.files[0];
        return file.size <= sizeInMB * 1024 * 1024;
      }

      // Handle File object
      if (value instanceof File) {
        return value.size <= sizeInMB * 1024 * 1024;
      }

      return true;
    },
    message,
  }),

  custom: (
    validateFn: (value: any, formValues?: any) => boolean,
    message = "Invalid value"
  ): ValidationRule => ({
    validate: validateFn,
    message,
  }),
};

/**
 * Validate a single value against provided rules
 * @param value - Value to validate
 * @param rules - Validation rules to apply
 * @param formValues - Optional form values for cross-field validation
 * @returns Object containing validation result
 */
export function validateField(
  value: any,
  rules: ValidationRule[],
  formValues?: Record<string, any>
): { valid: boolean; errors: string[] } {
  try {
    const errors: string[] = [];

    for (const rule of rules) {
      const isValid = rule.validate(value, formValues);

      if (!isValid) {
        errors.push(rule.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error("[Validator] Error in validateField:", error);
    return {
      valid: false,
      errors: ["Validation error occurred"],
    };
  }
}

/**
 * Validate all fields in a form object
 * @param formData - Form data object
 * @param validationSchema - Validation schema
 * @returns Object containing validation results
 */
export function validateForm(
  formData: Record<string, any>,
  validationSchema: Record<string, ValidationRule[]>
): {
  valid: boolean;
  errors: Record<string, string[]>;
  firstErrorField?: string;
} {
  try {
    const result: Record<string, string[]> = {};
    let valid = true;
    let firstErrorField: string | undefined;

    for (const field in validationSchema) {
      if (Object.prototype.hasOwnProperty.call(validationSchema, field)) {
        const rules = validationSchema[field];
        const value = formData[field];

        const fieldResult = validateField(value, rules, formData);

        if (!fieldResult.valid) {
          valid = false;
          result[field] = fieldResult.errors;

          // Record the first field with an error
          if (!firstErrorField) {
            firstErrorField = field;
          }
        }
      }
    }

    return {
      valid,
      errors: result,
      firstErrorField,
    };
  } catch (error) {
    console.error("[Validator] Error in validateForm:", error);
    return {
      valid: false,
      errors: {
        _form: ["Form validation failed"],
      },
    };
  }
}

/**
 * Create a reactive validation object for Vue
 * @param initialValues - Initial form values
 * @param validationSchema - Validation schema
 * @returns Validation object
 */
export function createValidation(
  initialValues: Record<string, any>,
  validationSchema: Record<string, ValidationRule[]>
): {
  validate: () => {
    valid: boolean;
    errors: Record<string, string[]>;
    firstErrorField?: string;
  };
  validateField: (field: string) => { valid: boolean; errors: string[] };
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  reset: () => void;
  markTouched: (field: string) => void;
  markAllTouched: () => void;
} {
  // Initialize validation state
  const errors: Record<string, string[]> = {};
  const touched: Record<string, boolean> = {};
  const dirty: Record<string, boolean> = {};

  // Initialize tracking objects
  Object.keys(validationSchema).forEach((field) => {
    errors[field] = [];
    touched[field] = false;
    dirty[field] = false;
  });

  return {
    // Validate entire form
    validate() {
      const result = validateForm(initialValues, validationSchema);
      Object.assign(errors, result.errors);
      return result;
    },

    // Validate single field
    validateField(field: string) {
      if (!validationSchema[field]) {
        console.warn(
          `[Validator] Field '${field}' does not exist in validation schema`
        );
        return { valid: true, errors: [] };
      }

      const rules = validationSchema[field];
      const value = initialValues[field];
      const result = validateField(value, rules, initialValues);

      errors[field] = result.errors;
      return result;
    },

    // Error messages by field
    errors,

    // Tracking which fields have been interacted with
    touched,

    // Tracking which fields have changed from initial values
    dirty,

    // Reset validation state
    reset() {
      Object.keys(errors).forEach((field) => {
        errors[field] = [];
        touched[field] = false;
        dirty[field] = false;
      });
    },

    // Mark field as touched (user has interacted with it)
    markTouched(field: string) {
      if (touched[field] !== undefined) {
        touched[field] = true;
      }
    },

    // Mark all fields as touched
    markAllTouched() {
      Object.keys(touched).forEach((field) => {
        touched[field] = true;
      });
    },
  };
}

export default {
  Rules,
  validateField,
  validateForm,
  createValidation,
};
