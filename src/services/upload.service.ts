import { apiService } from "./api";
import { ApiResponse, ValidationError, UploadProgressEvent } from "@/types";

type ProgressCallback = (event: UploadProgressEvent) => void;

interface UploadResult {
  fileUrl: string;
  fileKey: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface PresignedUrlResult {
  uploadUrl: string;
  fileKey: string;
  fields?: Record<string, string>;
}

/**
 * Utility for validating file uploads
 */
const fileValidation = {
  /**
   * Validate CV file
   * @param file - File to validate
   * @returns Validation result with error message if invalid
   */
  validateCV(file: File): { valid: boolean; message?: string } {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.oasis.opendocument.text",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: "Invalid file type. Please upload a PDF or Word document.",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        message: "File too large. Maximum size is 5MB.",
      };
    }

    // Validate file name length
    if (file.name.length > 100) {
      return {
        valid: false,
        message: "File name is too long. Maximum length is 100 characters.",
      };
    }

    return { valid: true };
  },

  /**
   * Validate photo file
   * @param file - File to validate
   * @returns Validation result with error message if invalid
   */
  validatePhoto(file: File): { valid: boolean; message?: string } {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message:
          "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.",
      };
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return {
        valid: false,
        message: "File too large. Maximum size is 2MB.",
      };
    }

    return { valid: true };
  },
};

/**
 * Service for handling file uploads
 */
export const uploadService = {
  /**
   * Upload CV document
   * @param file - CV file
   * @param onProgress - Progress callback
   * @returns Promise with upload result
   */
  async uploadCV(
    file: File,
    onProgress: ProgressCallback | null = null
  ): Promise<ApiResponse<UploadResult>> {
    if (!file) {
      return {
        success: false,
        error: {
          message: "CV file is required",
          type: "ValidationError",
        },
      };
    }

    // Validate file
    const validation = fileValidation.validateCV(file);
    if (!validation.valid) {
      return {
        success: false,
        error: {
          message: validation.message || "Invalid file",
          type: "ValidationError",
        },
      };
    }

    try {
      // If direct upload is enabled, use the presigned URL method
      if (process.env.VUE_APP_ENABLE_DIRECT_UPLOAD === "true") {
        return await this.uploadWithPresignedUrl("cv", file, onProgress);
      }

      // Otherwise use the standard server-mediated upload
      const formData = new FormData();
      formData.append("cv", file);

      return await apiService.upload<UploadResult>(
        "/user/upload-cv",
        formData,
        onProgress
      );
    } catch (error) {
      console.error("[UploadService] CV upload error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to upload CV",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Upload profile photo
   * @param file - Photo file
   * @param onProgress - Progress callback
   * @returns Promise with upload result
   */
  async uploadPhoto(
    file: File,
    onProgress: ProgressCallback | null = null
  ): Promise<ApiResponse<UploadResult>> {
    if (!file) {
      return {
        success: false,
        error: {
          message: "Photo file is required",
          type: "ValidationError",
        },
      };
    }

    // Validate file
    const validation = fileValidation.validatePhoto(file);
    if (!validation.valid) {
      return {
        success: false,
        error: {
          message: validation.message || "Invalid file",
          type: "ValidationError",
        },
      };
    }

    try {
      // If direct upload is enabled, use the presigned URL method
      if (process.env.VUE_APP_ENABLE_DIRECT_UPLOAD === "true") {
        return await this.uploadWithPresignedUrl("photo", file, onProgress);
      }

      // Otherwise use the standard server-mediated upload
      const formData = new FormData();
      formData.append("photo", file);

      return await apiService.upload<UploadResult>(
        "/user/upload-photo",
        formData,
        onProgress
      );
    } catch (error) {
      console.error("[UploadService] Photo upload error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to upload photo",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Get presigned URL for direct upload to cloud storage
   * @param uploadType - Type of upload (cv/photo)
   * @param file - File to upload
   * @returns Promise with presigned URL data
   */
  async getPresignedUrl(
    uploadType: string,
    file: File
  ): Promise<ApiResponse<PresignedUrlResult>> {
    if (!file) {
      return {
        success: false,
        error: {
          message: "File is required",
          type: "ValidationError",
        },
      };
    }

    try {
      return await apiService.post<PresignedUrlResult>(
        "/uploads/presigned-url",
        {
          fileType: file.type,
          fileName: file.name,
          fileSize: file.size,
          uploadType,
        }
      );
    } catch (error) {
      console.error("[UploadService] Presigned URL error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to get upload URL",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },

  /**
   * Upload file using presigned URL (direct-to-S3 upload)
   * @param uploadType - Type of upload (cv/photo)
   * @param file - File to upload
   * @param onProgress - Progress callback
   * @returns Promise with upload result
   */
  async uploadWithPresignedUrl(
    uploadType: string,
    file: File,
    onProgress: ProgressCallback | null = null
  ): Promise<ApiResponse<UploadResult>> {
    try {
      // Step 1: Get presigned URL from server
      const presignedUrlResponse = await this.getPresignedUrl(uploadType, file);

      if (!presignedUrlResponse.success) {
        return presignedUrlResponse as ApiResponse<UploadResult>;
      }

      const { uploadUrl, fileKey, fields } = presignedUrlResponse.data;

      // Step 2: Upload to storage provider directly
      const formData = new FormData();

      // Add any required fields for the storage provider
      if (fields) {
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      // Add the file as the last field
      formData.append("file", file);

      // Create custom XHR request to track progress
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (onProgress && event.lengthComputable) {
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded * 100) / event.total),
            });
          }
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Step 3: Notify server about successful upload
            const confirmResponse = await apiService.post<UploadResult>(
              "/uploads/confirm",
              {
                fileKey,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                uploadType,
              }
            );

            resolve(confirmResponse);
          } else {
            resolve({
              success: false,
              error: {
                message: `Upload failed with status ${xhr.status}`,
                type: "UploadError",
                status: xhr.status,
              },
            });
          }
        };

        xhr.onerror = () => {
          resolve({
            success: false,
            error: {
              message: "Network error during upload",
              type: "NetworkError",
            },
          });
        };

        xhr.onabort = () => {
          resolve({
            success: false,
            error: {
              message: "Upload aborted",
              type: "UploadAbortedError",
            },
          });
        };

        xhr.open("POST", uploadUrl, true);
        xhr.send(formData);
      });
    } catch (error) {
      console.error("[UploadService] Presigned URL upload error:", error);

      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to upload file",
          type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      };
    }
  },
};

export default uploadService;
