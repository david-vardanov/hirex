import { apiService } from "./api";
import {
  UserCredentials,
  RegistrationData,
  ApiResponse,
  ValidationError,
  UserProfile,
} from "@/types";

interface AuthResponse {
  token: string;
  user: UserProfile;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetCompletion {
  token: string;
  password: string;
  confirmPassword?: string;
}

/**
 * Service for handling authentication operations
 */
export const authService = {
  /**
   * Authenticate user with credentials
   * @param credentials - User login credentials
   * @returns Promise with authentication response
   */
  async login(
    credentials: UserCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    // Validate input
    if (!credentials?.email) {
      return this.createValidationErrorResponse("Email is required");
    }

    if (!credentials?.password) {
      return this.createValidationErrorResponse("Password is required");
    }

    // Email format validation
    if (!this.isValidEmail(credentials.email)) {
      return this.createValidationErrorResponse("Invalid email format");
    }

    try {
      return await apiService.post<AuthResponse>("/auth/login", credentials);
    } catch (error) {
      console.error("[AuthService] Login error:", error);

      // Normalize and return error
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Authentication failed",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Register new user
   * @param userData - User registration data
   * @returns Promise with registration response
   */
  async register(
    userData: RegistrationData
  ): Promise<ApiResponse<AuthResponse>> {
    // Validate required fields
    const requiredFields: (keyof RegistrationData)[] = [
      "email",
      "password",
      "name",
      "termsAccepted",
    ];

    for (const field of requiredFields) {
      if (!userData[field]) {
        return this.createValidationErrorResponse(`${field} is required`);
      }
    }

    // Validate terms acceptance
    if (!userData.termsAccepted) {
      return this.createValidationErrorResponse(
        "Terms and conditions must be accepted"
      );
    }

    // Email format validation
    if (!this.isValidEmail(userData.email)) {
      return this.createValidationErrorResponse("Invalid email format");
    }

    // Password strength validation
    if (userData.password.length < 8) {
      return this.createValidationErrorResponse(
        "Password must be at least 8 characters long"
      );
    }

    try {
      // Remove confirmPassword if present (not needed on backend)
      const { confirmPassword, ...dataToSend } = userData as any;

      return await apiService.post<AuthResponse>("/auth/register", dataToSend);
    } catch (error) {
      console.error("[AuthService] Registration error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Registration failed",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Validate authentication token
   * @param token - Authentication token
   * @returns Promise with validation response
   */
  async validate(token: string): Promise<ApiResponse<{ user: UserProfile }>> {
    if (!token) {
      return this.createValidationErrorResponse("Token is required");
    }

    try {
      return await apiService.post<{ user: UserProfile }>("/auth/validate", {
        token,
      });
    } catch (error) {
      console.error("[AuthService] Token validation error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Token validation failed",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Request password reset
   * @param email - User email
   * @returns Promise with request response
   */
  async requestPasswordReset(
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    if (!email) {
      return this.createValidationErrorResponse("Email is required");
    }

    if (!this.isValidEmail(email)) {
      return this.createValidationErrorResponse("Invalid email format");
    }

    try {
      return await apiService.post<{ message: string }>(
        "/auth/reset-password",
        { email }
      );
    } catch (error) {
      console.error("[AuthService] Password reset request error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Password reset request failed",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Complete password reset with token
   * @param resetData - Password reset completion data
   * @returns Promise with completion response
   */
  async completePasswordReset(
    resetData: PasswordResetCompletion
  ): Promise<ApiResponse<{ message: string }>> {
    // Validate required fields
    if (!resetData.token) {
      return this.createValidationErrorResponse("Reset token is required");
    }

    if (!resetData.password) {
      return this.createValidationErrorResponse("New password is required");
    }

    // Password strength validation
    if (resetData.password.length < 8) {
      return this.createValidationErrorResponse(
        "Password must be at least 8 characters long"
      );
    }

    // Password confirmation validation
    if (
      resetData.confirmPassword &&
      resetData.password !== resetData.confirmPassword
    ) {
      return this.createValidationErrorResponse("Passwords do not match");
    }

    try {
      // Remove confirmPassword if present (not needed on backend)
      const { confirmPassword, ...dataToSend } = resetData;

      return await apiService.post<{ message: string }>(
        "/auth/complete-reset",
        dataToSend
      );
    } catch (error) {
      console.error("[AuthService] Password reset completion error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Password reset completion failed",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Create a standard validation error response
   * @param message - Error message
   * @returns Formatted error response
   */
  createValidationErrorResponse<T>(message: string): ApiResponse<T> {
    return {
      success: false,
      error: {
        message,
        type: "ValidationError",
      },
    };
  },

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns Whether email is valid
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};

export default authService;
