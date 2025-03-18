/**
 * Core application type definitions
 */

// API Response types
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  status: number;
  headers?: Record<string, string>;
}

export interface ApiErrorDetail {
  message: string;
  type: string;
  status?: number;
  code?: string;
  data?: any;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  originalError?: Error;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// User related types
export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  photo?: string;
  profession?: string;
  experience?: number;
  bio?: string;
  skills?: string[];
  cvUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStatus {
  id: string;
  status:
    | "pending"
    | "reviewing"
    | "interview_scheduled"
    | "approved"
    | "rejected";
  currentStage: number;
  totalStages: number;
  lastUpdated: string;
  nextAction?: {
    type: "call" | "interview" | "document" | "wait";
    dueDate?: string;
    description?: string;
  };
  timeline: Array<{
    date: string;
    action: string;
    status: "completed" | "current" | "upcoming";
  }>;
}

export interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
  generalAnnouncements: boolean;
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

// Registration types
export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  profession?: string;
  experience?: number;
  skills?: string[];
  bio?: string;
  termsAccepted: boolean;
}

// Error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class AppError extends Error {
  code?: string;
  status?: number;
  data?: any;

  constructor(
    message: string,
    options?: { code?: string; status?: number; data?: any }
  ) {
    super(message);
    this.name = "AppError";
    if (options) {
      this.code = options.code;
      this.status = options.status;
      this.data = options.data;
    }
  }
}
