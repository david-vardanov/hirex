import { apiService } from "./api";
import {
  ApiResponse,
  ValidationError,
  UserProfile,
  ApplicationStatus,
  NotificationPreferences,
} from "@/types";

interface ProfileUpdateData {
  name?: string;
  phone?: string;
  profession?: string;
  experience?: number;
  bio?: string;
  skills?: string[];
}

interface UpcomingEvent {
  id: string;
  type: "call" | "interview" | "meeting";
  title: string;
  description?: string;
  scheduledFor: string; // ISO date
  duration?: number; // in minutes
  location?: string;
  participants?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  status: "scheduled" | "completed" | "cancelled";
}

/**
 * Service for handling user-related operations
 */
export const userService = {
  /**
   * Get current user profile
   * @returns Promise with user profile data
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiService.get<UserProfile>("/user/profile");
    } catch (error) {
      console.error("[UserService] Get profile error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to fetch profile",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Update user profile
   * @param profileData - Updated profile data
   * @returns Promise with update result
   */
  async updateProfile(
    profileData: ProfileUpdateData
  ): Promise<ApiResponse<UserProfile>> {
    if (!profileData || Object.keys(profileData).length === 0) {
      return {
        success: false,
        error: {
          message: "No profile data provided for update",
          type: "ValidationError",
        },
      };
    }

    // Validate inputs
    if (profileData.name !== undefined && profileData.name.trim() === "") {
      return {
        success: false,
        error: {
          message: "Name cannot be empty",
          type: "ValidationError",
        },
      };
    }

    if (profileData.experience !== undefined && profileData.experience < 0) {
      return {
        success: false,
        error: {
          message: "Experience cannot be negative",
          type: "ValidationError",
        },
      };
    }

    // Limit bio length
    if (profileData.bio !== undefined && profileData.bio.length > 1000) {
      return {
        success: false,
        error: {
          message: "Bio is too long, maximum 1000 characters",
          type: "ValidationError",
        },
      };
    }

    // Validate skills array
    if (profileData.skills !== undefined) {
      if (!Array.isArray(profileData.skills)) {
        return {
          success: false,
          error: {
            message: "Skills must be an array",
            type: "ValidationError",
          },
        };
      }

      // Check for empty skills
      if (profileData.skills.some((skill) => !skill || skill.trim() === "")) {
        return {
          success: false,
          error: {
            message: "Skills cannot contain empty values",
            type: "ValidationError",
          },
        };
      }
    }

    try {
      return await apiService.put<UserProfile>("/user/profile", profileData);
    } catch (error) {
      console.error("[UserService] Update profile error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to update profile",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Get user's application status
   * @returns Promise with application status data
   */
  async getApplicationStatus(): Promise<ApiResponse<ApplicationStatus>> {
    try {
      return await apiService.get<ApplicationStatus>(
        "/user/application-status"
      );
    } catch (error) {
      console.error("[UserService] Get application status error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch application status",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Get user's upcoming events (calls, interviews)
   * @returns Promise with upcoming events data
   */
  async getUpcomingEvents(): Promise<ApiResponse<UpcomingEvent[]>> {
    try {
      return await apiService.get<UpcomingEvent[]>("/user/events");
    } catch (error) {
      console.error("[UserService] Get events error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch upcoming events",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Update user's notification preferences
   * @param preferences - Notification preferences
   * @returns Promise with update result
   */
  async updateNotificationPreferences(
    preferences: NotificationPreferences
  ): Promise<ApiResponse<NotificationPreferences>> {
    if (!preferences) {
      return {
        success: false,
        error: {
          message: "Notification preferences are required",
          type: "ValidationError",
        },
      };
    }

    try {
      return await apiService.put<NotificationPreferences>(
        "/user/notification-preferences",
        preferences
      );
    } catch (error) {
      console.error(
        "[UserService] Update notification preferences error:",
        error
      );

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to update notification preferences",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Confirm or decline an event
   * @param eventId - ID of the event
   * @param status - New status (confirm/decline)
   * @returns Promise with update result
   */
  async respondToEvent(
    eventId: string,
    status: "confirm" | "decline",
    comment?: string
  ): Promise<ApiResponse<{ message: string }>> {
    if (!eventId) {
      return {
        success: false,
        error: {
          message: "Event ID is required",
          type: "ValidationError",
        },
      };
    }

    try {
      return await apiService.post<{ message: string }>(
        `/user/events/${eventId}/respond`,
        { status, comment }
      );
    } catch (error) {
      console.error("[UserService] Event response error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to respond to event",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Get summary of user's profile completion status
   * @returns Promise with profile completion data
   */
  async getProfileCompletionStatus(): Promise<
    ApiResponse<{
      completionPercentage: number;
      missingFields: string[];
      recommendations: string[];
    }>
  > {
    try {
      return await apiService.get("/user/profile-completion");
    } catch (error) {
      console.error("[UserService] Profile completion status error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch profile completion status",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },
};

export default userService;
