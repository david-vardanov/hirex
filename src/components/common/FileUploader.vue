<template>
    <div class="file-uploader" :class="[
        `file-uploader--${variant}`,
        { 'file-uploader--compact': compact },
        { 'file-uploader--error': !!error },
        { 'file-uploader--dragover': isDragOver },
        { 'file-uploader--has-file': hasFile },
        { 'file-uploader--disabled': disabled },
        { 'file-uploader--loading': loading }
    ]">
        <!-- Hidden file input element -->
        <input type="file" ref="fileInput" class="file-uploader__input" :accept="acceptTypes" :multiple="multiple"
            :disabled="disabled || loading" @change="handleFileChange" />

        <!-- Drag and drop area -->
        <div class="file-uploader__dropzone" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop" @click="triggerFileSelect">
            <!-- Loading state with spinner -->
            <div v-if="loading" class="file-uploader__loading">
                <ion-spinner name="dots" />
                <span class="file-uploader__loading-text">{{ loadingText }}</span>
            </div>

            <!-- File selection prompt (empty state) -->
            <div v-else-if="!hasFile" class="file-uploader__prompt">
                <div class="file-uploader__icon">
                    <ion-icon :icon="uploadIcon" />
                </div>
                <div class="file-uploader__text">
                    <div class="file-uploader__title">{{ title || 'Upload a file' }}</div>
                    <div class="file-uploader__subtitle">
                        {{ subtitle || `Drag and drop or click to browse` }}
                    </div>
                    <div v-if="acceptedTypesDisplay" class="file-uploader__accepted-types">
                        {{ acceptedTypesDisplay }}
                    </div>
                </div>
            </div>

            <!-- File preview (file selected state) -->
            <div v-else class="file-uploader__preview">
                <!-- Image preview if file is an image -->
                <div v-if="isImageFile" class="file-uploader__preview-image">
                    <img :src="previewUrl" alt="Preview" class="file-uploader__image" />
                </div>

                <!-- Generic file icon for non-image files -->
                <div v-else class="file-uploader__preview-icon">
                    <ion-icon :icon="getFileIcon()" />
                </div>

                <!-- File information -->
                <div class="file-uploader__file-info">
                    <div class="file-uploader__filename">{{ fileName }}</div>
                    <div class="file-uploader__filesize">{{ formattedFileSize }}</div>
                </div>

                <!-- Remove file button -->
                <button class="file-uploader__remove-btn" @click.stop="removeFile" :disabled="disabled || loading"
                    v-if="!disabled && !loading">
                    <ion-icon :icon="removeIcon" />
                </button>
            </div>
        </div>

        <!-- Progress bar during upload -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="file-uploader__progress">
            <ProgressBar :value="uploadProgress" variant="primary" :height="4" :show-percentage="false" animated />
        </div>

        <!-- Error message -->
        <div v-if="error" class="file-uploader__error-message">
            {{ error }}
        </div>

        <!-- Optional help text -->
        <div v-if="helpText && !error" class="file-uploader__help-text">
            {{ helpText }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watch } from 'vue';
import { IonIcon, IonSpinner } from '@ionic/vue';
import ProgressBar from './ProgressBar.vue';

// Import required icons
import {
    cloudUploadOutline,
    documentOutline,
    imageOutline,
    documentTextOutline,
    closeCircleOutline
} from 'ionicons/icons';

// File types supported with icon mapping
type FileCategory = 'image' | 'document' | 'pdf' | 'spreadsheet' | 'archive' | 'code' | 'audio' | 'video' | 'other';

// File type to icon mapping
const fileIconMap = {
    image: imageOutline,
    document: documentTextOutline,
    pdf: documentTextOutline,
    spreadsheet: documentTextOutline,
    archive: documentOutline,
    code: documentTextOutline,
    audio: documentOutline,
    video: documentOutline,
    other: documentOutline
};

// File extension to type mapping
const fileExtensionMap: Record<string, FileCategory> = {
    // Images
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'svg': 'image',
    'webp': 'image',

    // Documents
    'doc': 'document',
    'docx': 'document',
    'txt': 'document',
    'rtf': 'document',

    // PDFs
    'pdf': 'pdf',

    // Spreadsheets
    'xls': 'spreadsheet',
    'xlsx': 'spreadsheet',
    'csv': 'spreadsheet',

    // Archives
    'zip': 'archive',
    'rar': 'archive',
    'tar': 'archive',
    'gz': 'archive',

    // Code
    'html': 'code',
    'css': 'code',
    'js': 'code',
    'ts': 'code',
    'json': 'code',

    // Audio
    'mp3': 'audio',
    'wav': 'audio',
    'ogg': 'audio',

    // Video
    'mp4': 'video',
    'webm': 'video',
    'avi': 'video'
};

// Component variants
type UploaderVariant = 'primary' | 'secondary' | 'neutral';

export default defineComponent({
    name: 'FileUploader',
    components: {
        IonIcon,
        IonSpinner,
        ProgressBar
    },
    props: {
        variant: {
            type: String as PropType<UploaderVariant>,
            default: 'primary',
            validator: (val: string) => ['primary', 'secondary', 'neutral'].includes(val)
        },
        accept: {
            type: String,
            default: ''
        },
        multiple: {
            type: Boolean,
            default: false
        },
        maxFileSize: {
            type: Number,
            default: 5 // in MB
        },
        title: {
            type: String,
            default: ''
        },
        subtitle: {
            type: String,
            default: ''
        },
        helpText: {
            type: String,
            default: ''
        },
        compact: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        loadingText: {
            type: String,
            default: 'Uploading...'
        },
        uploadProgress: {
            type: Number,
            default: 0
        },
        modelValue: {
            type: [File, Array] as PropType<File | File[] | null>,
            default: null
        },
        error: {
            type: String,
            default: ''
        }
    },
    emits: ['update:modelValue', 'file-selected', 'file-removed', 'error'],
    setup(props, { emit }) {
        const fileInput = ref<HTMLInputElement | null>(null);
        const isDragOver = ref<boolean>(false);
        const previewUrl = ref<string>('');

        // Convert accept prop to array of file extensions
        const acceptTypes = computed(() => props.accept);

        // Human-readable accepted types for display
        const acceptedTypesDisplay = computed(() => {
            if (!props.accept) return '';

            const types = props.accept.split(',').map(type => {
                // Extract extension from MIME type or glob pattern
                const ext = type.trim();
                if (ext.startsWith('.')) {
                    // Already an extension
                    return ext;
                } else if (ext.includes('/')) {
                    // MIME type like 'image/png'
                    const parts = ext.split('/');
                    if (parts[1] === '*') {
                        return parts[0].toUpperCase();
                    }
                    return parts[1].toUpperCase();
                }
                return ext;
            });

            return `Accepted formats: ${types.join(', ')}`;
        });

        // Computed properties for file display
        const hasFile = computed(() => {
            if (Array.isArray(props.modelValue)) {
                return props.modelValue.length > 0;
            }
            return !!props.modelValue;
        });

        const fileName = computed(() => {
            if (!hasFile.value) return '';

            if (Array.isArray(props.modelValue)) {
                if (props.modelValue.length === 0) return '';
                if (props.modelValue.length === 1) return props.modelValue[0].name;
                return `${props.modelValue.length} files selected`;
            }

            return props.modelValue?.name || '';
        });

        const formattedFileSize = computed(() => {
            if (!hasFile.value) return '';

            let size = 0;
            if (Array.isArray(props.modelValue)) {
                if (props.modelValue.length === 0) return '';
                size = props.modelValue.reduce((sum, file) => sum + file.size, 0);
            } else if (props.modelValue) {
                size = props.modelValue.size;
            }

            // Format size to appropriate unit
            if (size < 1024) {
                return `${size} B`;
            } else if (size < 1024 * 1024) {
                return `${(size / 1024).toFixed(1)} KB`;
            } else {
                return `${(size / (1024 * 1024)).toFixed(1)} MB`;
            }
        });

        const isImageFile = computed(() => {
            if (!hasFile.value) return false;

            const file = Array.isArray(props.modelValue)
                ? props.modelValue[0]
                : props.modelValue;

            if (!file) return false;

            return file.type.startsWith('image/');
        });

        // Icon references
        const uploadIcon = cloudUploadOutline;
        const removeIcon = closeCircleOutline;

        /**
         * Get appropriate icon for file type
         */
        const getFileIcon = (): string => {
            if (!hasFile.value) return documentOutline;

            const file = Array.isArray(props.modelValue)
                ? props.modelValue[0]
                : props.modelValue;

            if (!file) return documentOutline;

            // Check if it's an image
            if (file.type.startsWith('image/')) {
                return imageOutline;
            }

            // Get file extension
            const extension = file.name.split('.').pop()?.toLowerCase() || '';
            const fileType = fileExtensionMap[extension] || 'other';

            return fileIconMap[fileType];
        };

        /**
         * Generate image preview for image files
         */
        const generatePreview = () => {
            // Clear any existing preview URL
            if (previewUrl.value) {
                URL.revokeObjectURL(previewUrl.value);
                previewUrl.value = '';
            }

            if (!hasFile.value) return;

            const file = Array.isArray(props.modelValue)
                ? props.modelValue[0]
                : props.modelValue;

            if (!file || !file.type.startsWith('image/')) return;

            // Create object URL for preview
            previewUrl.value = URL.createObjectURL(file);
        };

        /**
         * Validate file(s) before emitting events
         */
        const validateFiles = (files: File | File[]): { valid: boolean; error?: string } => {
            if (!files) return { valid: false, error: 'No file selected' };

            const filesToCheck = Array.isArray(files) ? files : [files];

            // Check if any files were selected
            if (filesToCheck.length === 0) {
                return { valid: false, error: 'No file selected' };
            }

            // Check each file's size
            for (const file of filesToCheck) {
                const fileSizeMB = file.size / (1024 * 1024);
                if (fileSizeMB > props.maxFileSize) {
                    return {
                        valid: false,
                        error: `File size exceeds the ${props.maxFileSize}MB limit`
                    };
                }
            }

            // Check file type if accept prop is provided
            if (props.accept) {
                const acceptedTypes = props.accept.split(',').map(type => type.trim());

                for (const file of filesToCheck) {
                    let isAccepted = false;

                    for (const acceptType of acceptedTypes) {
                        // Check for MIME type match
                        if (acceptType.includes('/')) {
                            // Full MIME type (e.g., image/png) or wildcard (e.g., image/*)
                            const [category, subtype] = acceptType.split('/');
                            if (subtype === '*') {
                                // Category wildcard (e.g., image/*)
                                if (file.type.startsWith(`${category}/`)) {
                                    isAccepted = true;
                                    break;
                                }
                            } else if (file.type === acceptType) {
                                // Exact match
                                isAccepted = true;
                                break;
                            }
                        }
                        // Check for extension match
                        else if (acceptType.startsWith('.')) {
                            const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
                            if (extension === acceptType.toLowerCase()) {
                                isAccepted = true;
                                break;
                            }
                        }
                    }

                    if (!isAccepted) {
                        return {
                            valid: false,
                            error: `Invalid file type. Please upload ${acceptedTypesDisplay.value.toLowerCase()}`
                        };
                    }
                }
            }

            return { valid: true };
        };

        /**
         * Handle drag over event
         */
        const handleDragOver = (event: DragEvent) => {
            if (props.disabled || props.loading) return;

            isDragOver.value = true;

            // Check if files are being dragged
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
            }
        };

        /**
         * Handle drag leave event
         */
        const handleDragLeave = () => {
            isDragOver.value = false;
        };

        /**
         * Handle drop event
         */
        const handleDrop = (event: DragEvent) => {
            if (props.disabled || props.loading) return;

            isDragOver.value = false;

            if (!event.dataTransfer || !event.dataTransfer.files.length) return;

            const droppedFiles = event.dataTransfer.files;

            if (props.multiple) {
                const filesArray = Array.from(droppedFiles);
                const validation = validateFiles(filesArray);

                if (validation.valid) {
                    emit('update:modelValue', filesArray);
                    emit('file-selected', filesArray);
                } else if (validation.error) {
                    emit('error', validation.error);
                }
            } else {
                // Take only the first file when multiple is false
                const file = droppedFiles[0];
                const validation = validateFiles(file);

                if (validation.valid) {
                    emit('update:modelValue', file);
                    emit('file-selected', file);
                } else if (validation.error) {
                    emit('error', validation.error);
                }
            }
        };

        /**
         * Trigger file input click
         */
        const triggerFileSelect = () => {
            if (props.disabled || props.loading) return;

            fileInput.value?.click();
        };

        /**
         * Handle file input change
         */
        const handleFileChange = (event: Event) => {
            const input = event.target as HTMLInputElement;

            if (!input.files || input.files.length === 0) return;

            if (props.multiple) {
                const filesArray = Array.from(input.files);
                const validation = validateFiles(filesArray);

                if (validation.valid) {
                    emit('update:modelValue', filesArray);
                    emit('file-selected', filesArray);
                } else if (validation.error) {
                    emit('error', validation.error);
                    input.value = ''; // Clear the input
                }
            } else {
                // Take only the first file when multiple is false
                const file = input.files[0];
                const validation = validateFiles(file);

                if (validation.valid) {
                    emit('update:modelValue', file);
                    emit('file-selected', file);
                } else if (validation.error) {
                    emit('error', validation.error);
                    input.value = ''; // Clear the input
                }
            }
        };

        /**
         * Remove selected file(s)
         */
        const removeFile = (event: Event) => {
            event.stopPropagation();

            if (props.disabled || props.loading) return;

            if (fileInput.value) {
                fileInput.value.value = '';
            }

            // Clear preview URL if any
            if (previewUrl.value) {
                URL.revokeObjectURL(previewUrl.value);
                previewUrl.value = '';
            }

            emit('update:modelValue', props.multiple ? [] : null);
            emit('file-removed');
        };

        // Update preview when model value changes
        watch(() => props.modelValue, generatePreview, { immediate: true });

        // Clean up resources when component is destroyed
        watch(() => previewUrl.value, (url, oldUrl) => {
            if (oldUrl && oldUrl !== url) {
                URL.revokeObjectURL(oldUrl);
            }
        });

        return {
            fileInput,
            isDragOver,
            previewUrl,
            acceptTypes,
            acceptedTypesDisplay,
            hasFile,
            fileName,
            formattedFileSize,
            isImageFile,
            uploadIcon,
            removeIcon,
            getFileIcon,
            handleDragOver,
            handleDragLeave,
            handleDrop,
            triggerFileSelect,
            handleFileChange,
            removeFile
        };
    }
});
</script>

<style lang="scss" scoped>
.file-uploader {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 16px;

    // Hide the actual file input
    &__input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        overflow: hidden;
        z-index: -1;
    }

    // Color variants
    &--primary {
        --uploader-border-color: rgba(var(--ion-color-primary-rgb), 0.3);
        --uploader-bg-color: rgba(var(--ion-color-primary-rgb), 0.05);
        --uploader-accent-color: var(--ion-color-primary);
        --uploader-text-color: var(--ion-color-dark);
        --uploader-icon-color: var(--ion-color-primary);
    }

    &--secondary {
        --uploader-border-color: rgba(var(--ion-color-secondary-rgb), 0.3);
        --uploader-bg-color: rgba(var(--ion-color-secondary-rgb), 0.05);
        --uploader-accent-color: var(--ion-color-secondary);
        --uploader-text-color: var(--ion-color-dark);
        --uploader-icon-color: var(--ion-color-secondary);
    }

    &--neutral {
        --uploader-border-color: rgba(var(--ion-color-medium-rgb), 0.3);
        --uploader-bg-color: rgba(var(--ion-color-medium-rgb), 0.05);
        --uploader-accent-color: var(--ion-color-medium);
        --uploader-text-color: var(--ion-color-dark);
        --uploader-icon-color: var(--ion-color-medium);
    }

    // Error state
    &--error {
        --uploader-border-color: rgba(var(--ion-color-danger-rgb), 0.3);
        --uploader-bg-color: rgba(var(--ion-color-danger-rgb), 0.05);
        --uploader-accent-color: var(--ion-color-danger);
        --uploader-icon-color: var(--ion-color-danger);
    }

    // Dropzone area
    &__dropzone {
        border: 2px dashed var(--uploader-border-color);
        border-radius: 8px;
        background-color: var(--uploader-bg-color);
        padding: 24px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        .file-uploader--compact & {
            padding: 16px;
        }

        .file-uploader--dragover & {
            border-color: var(--uploader-accent-color);
            background-color: rgba(var(--ion-color-primary-rgb), 0.1);
            transform: scale(1.02);
        }

        .file-uploader--has-file & {
            border-style: solid;
            background-color: var(--uploader-bg-color);
        }

        .file-uploader--disabled & {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }

    // Empty state prompt
    &__prompt {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    &__icon {
        font-size: 36px;
        color: var(--uploader-icon-color);
        margin-bottom: 16px;

        .file-uploader--compact & {
            font-size: 28px;
            margin-bottom: 12px;
        }
    }

    &__text {
        max-width: 240px;
        margin: 0 auto;
    }

    &__title {
        font-size: 16px;
        font-weight: 600;
        color: var(--uploader-text-color);
        margin-bottom: 8px;

        .file-uploader--compact & {
            font-size: 14px;
            margin-bottom: 4px;
        }
    }

    &__subtitle {
        font-size: 14px;
        color: var(--ion-color-medium);
        margin-bottom: 8px;

        .file-uploader--compact & {
            font-size: 12px;
            margin-bottom: 4px;
        }
    }

    &__accepted-types {
        font-size: 12px;
        color: var(--ion-color-medium);
        opacity: 0.8;

        .file-uploader--compact & {
            font-size: 10px;
        }
    }

    // File preview state
    &__preview {
        display: flex;
        align-items: center;
        text-align: left;
    }

    &__preview-image {
        width: 60px;
        height: 60px;
        margin-right: 16px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
    }

    &__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &__preview-icon {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        background-color: rgba(var(--ion-color-light-rgb), 0.5);
        border-radius: 4px;
        flex-shrink: 0;

        ion-icon {
            font-size: 30px;
            color: var(--uploader-icon-color);
        }
    }

    &__file-info {
        flex-grow: 1;
        min-width: 0; // Enable text truncation
    }

    &__filename {
        font-weight: 600;
        font-size: 16px;
        color: var(--uploader-text-color);
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__filesize {
        font-size: 14px;
        color: var(--ion-color-medium);
    }

    &__remove-btn {
        background: none;
        border: none;
        color: var(--ion-color-medium);
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
        margin: -8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &:hover {
            color: var(--ion-color-danger);
            background-color: rgba(var(--ion-color-danger-rgb), 0.1);
        }

        &:focus {
            outline: none;
        }
    }

    // Loading state
    &__loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        ion-spinner {
            margin-bottom: 8px;
            color: var(--uploader-accent-color);
        }
    }

    &__loading-text {
        font-size: 14px;
        color: var(--ion-color-medium);
    }

    // Progress bar
    &__progress {
        margin-top: 8px;
    }

    // Error message
    &__error-message {
        margin-top: 8px;
        font-size: 12px;
        color: var(--ion-color-danger);
    }

    // Help text
    &__help-text {
        margin-top: 8px;
        font-size: 12px;
        color: var(--ion-color-medium);
    }
}
</style>