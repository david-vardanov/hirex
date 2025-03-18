import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "@/services/auth.service";
import {
  UserProfile,
  UserCredentials,
  Notification,
  RegistrationData,
  ApiResponse,
  ValidationError,
} from "@/types";

interface LoginResult {
  success: boolean;
  error?: {
    message: string;
    type: string;
  };
}

export const useAppStore = defineStore("app", () => {
  // State
  const user = ref<UserProfile | null>(null);
  const authToken = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<{ message: string; type: string } | null>(null);
  const notifications = ref<Notification[]>([]);

  // Computed
  const isAuthenticated = computed<boolean>(() => !!authToken.value);
  const userProfile = computed<UserProfile | {}>(() => user.value || {});
  const hasNotifications = computed<boolean>(
    () => notifications.value.length > 0
  );
  const unreadNotificationsCount = computed<number>(
    () => notifications.value.filter((n) => !n.read).length
  );

  // Error handling helper
  const handleError = (err: unknown): { message: string; type: string } => {
    if (err instanceof Error) {
      return {
        message: err.message,
        type: err.constructor.name,
      };
    } else {
      return {
        message: "An unknown error occurred",
        type: "UnknownError",
      };
    }
  };

  // Actions
  async function login(credentials: UserCredentials): Promise<LoginResult> {
    // Input validation
    if (!credentials?.email || !credentials?.password) {
      return {
        success: false,
        error: {
          message: "Email and password are required",
          type: "ValidationError",
        },
      };
    }

    try {
      isLoading.value = true;
      error.value = null;

      const response = await authService.login(credentials);

      if (response.success) {
        authToken.value = response.data.token;
        user.value = response.data.user;
        localStorage.setItem("auth_token", response.data.token);
        return { success: true };
      } else {
        error.value = response.error;
        return { success: false, error: response.error };
      }
    } catch (err) {
      const normalizedError = handleError(err);
      error.value = normalizedError;
      console.error("[AuthStore] Login error:", normalizedError);
      return {
        success: false,
        error: normalizedError,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function register(userData: RegistrationData): Promise<LoginResult> {
    // Validate required fields
    const requiredFields = ["email", "password", "name", "termsAccepted"];
    const missingFields = requiredFields.filter(
      (field) => !userData[field as keyof RegistrationData]
    );

    if (missingFields.length > 0) {
      return {
        success: false,
        error: {
          message: `Missing required fields: ${missingFields.join(", ")}`,
          type: "ValidationError",
        },
      };
    }

    if (!userData.termsAccepted) {
      return {
        success: false,
        error: {
          message: "You must accept the terms and conditions",
          type: "ValidationError",
        },
      };
    }

    try {
      isLoading.value = true;
      error.value = null;

      const response = await authService.register(userData);

      if (response.success) {
        authToken.value = response.data.token;
        user.value = response.data.user;
        localStorage.setItem("auth_token", response.data.token);
        return { success: true };
      } else {
        error.value = response.error;
        return { success: false, error: response.error };
      }
    } catch (err) {
      const normalizedError = handleError(err);
      error.value = normalizedError;
      console.error("[AuthStore] Registration error:", normalizedError);
      return {
        success: false,
        error: normalizedError,
      };
    } finally {
      isLoading.value = false;
    }
  }

  function logout(): void {
    try {
      authToken.value = null;
      user.value = null;
      localStorage.removeItem("auth_token");
    } catch (err) {
      console.error("[AuthStore] Logout error:", err);
      // Ensure clean state even if error occurs
      authToken.value = null;
      user.value = null;
    }
  }

  async function restoreSession(token: string): Promise<boolean> {
    if (!token) return false;

    try {
      isLoading.value = true;
      const response = await authService.validate(token);

      if (response.success) {
        authToken.value = token;
        user.value = response.data.user;
        return true;
      } else {
        // Invalid token
        logout();
        return false;
      }
    } catch (err) {
      console.error("[AuthStore] Session restore error:", err);
      logout();
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function addNotification(
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ): void {
    try {
      notifications.value.push({
        id: Date.now(),
        timestamp: new Date(),
        read: false,
        ...notification,
      });
    } catch (err) {
      console.error("[NotificationStore] Add notification error:", err);
    }
  }

  function markNotificationAsRead(id: string | number): void {
    try {
      const notification = notifications.value.find((n) => n.id === id);
      if (notification) {
        notification.read = true;
      }
    } catch (err) {
      console.error("[NotificationStore] Mark notification error:", err);
    }
  }

  function clearNotifications(): void {
    try {
      notifications.value = [];
    } catch (err) {
      console.error("[NotificationStore] Clear notifications error:", err);
      // Force reset on error
      notifications.value = [];
    }
  }

  return {
    // State
    user,
    authToken,
    isLoading,
    error,
    notifications,

    // Computed
    isAuthenticated,
    userProfile,
    hasNotifications,
    unreadNotificationsCount,

    // Actions
    login,
    register,
    logout,
    restoreSession,
    addNotification,
    markNotificationAsRead,
    clearNotifications,
  };
});
