<template>
    <div class="progress-bar" :class="[
        `progress-bar--${variant}`,
        { 'progress-bar--animated': animated },
        { 'progress-bar--labeled': showLabels },
        { 'progress-bar--with-steps': isStepProgress }
    ]">
        <!-- Label for the progress -->
        <div v-if="label" class="progress-bar__header">
            <div class="progress-bar__label">{{ label }}</div>
            <div class="progress-bar__percentage" v-if="showPercentage">{{ Math.round(value) }}%</div>
        </div>

        <!-- Main progress track -->
        <div class="progress-bar__track" ref="trackRef">
            <!-- Progress fill -->
            <div class="progress-bar__fill" :style="fillStyle" ref="fillRef">
                <!-- Visual effect for the animated edge -->
                <div v-if="animated" class="progress-bar__pulse"></div>
            </div>

            <!-- Step markers for step-based progress -->
            <div v-if="isStepProgress" class="progress-bar__steps">
                <div v-for="(step, index) in steps" :key="`step-${index}`" class="progress-bar__step" :class="{
                    'progress-bar__step--active': index <= completedSteps,
                    'progress-bar__step--current': index === completedSteps
                }" :style="{ left: `${(index / (steps.length - 1)) * 100}%` }">
                    <div class="progress-bar__step-marker"></div>
                    <div v-if="showLabels" class="progress-bar__step-label">
                        {{ step.label }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Optional description text -->
        <div v-if="description" class="progress-bar__description">
            {{ description }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, PropType } from 'vue';
import gsap from 'gsap';
import { ANIMATION_TIMING, EASING } from '@/utils/animations';

// Progress bar variants
type ProgressVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

// Step definition for step-based progress
interface ProgressStep {
    label: string;
    value: number;
    description?: string;
}

export default defineComponent({
    name: 'ProgressBar',
    props: {
        value: {
            type: Number,
            default: 0,
            validator: (val: number) => val >= 0 && val <= 100
        },
        variant: {
            type: String as PropType<ProgressVariant>,
            default: 'primary',
            validator: (val: string) => ['primary', 'secondary', 'success', 'warning', 'danger', 'info'].includes(val)
        },
        showPercentage: {
            type: Boolean,
            default: true
        },
        label: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        animated: {
            type: Boolean,
            default: true
        },
        height: {
            type: Number,
            default: 8 // Default height in pixels
        },
        rounded: {
            type: Boolean,
            default: true
        },
        striped: {
            type: Boolean,
            default: false
        },
        // Step-based progress options
        steps: {
            type: Array as PropType<ProgressStep[]>,
            default: () => []
        },
        completedSteps: {
            type: Number,
            default: 0
        },
        showLabels: {
            type: Boolean,
            default: true
        },
        // Animation options
        animateChanges: {
            type: Boolean,
            default: true
        },
        animationDuration: {
            type: Number,
            default: ANIMATION_TIMING.STANDARD
        }
    },
    setup(props) {
        const trackRef = ref<HTMLElement | null>(null);
        const fillRef = ref<HTMLElement | null>(null);

        // Computed properties
        const isStepProgress = computed(() => props.steps.length > 0);

        const effectiveValue = computed(() => {
            if (isStepProgress.value && props.completedSteps >= 0) {
                // Calculate percentage based on completed steps
                return props.completedSteps >= props.steps.length - 1
                    ? 100
                    : (props.completedSteps / (props.steps.length - 1)) * 100;
            }
            return Math.min(Math.max(props.value, 0), 100);
        });

        const fillStyle = computed(() => {
            return {
                width: `${effectiveValue.value}%`,
                height: `${props.height}px`,
                borderRadius: props.rounded ? `${props.height / 2}px` : '0'
            };
        });

        /**
         * Animate progress changes
         * @param oldValue - Previous value
         * @param newValue - New value
         */
        const animateProgress = (oldValue: number, newValue: number) => {
            try {
                if (!props.animateChanges || !fillRef.value) return;

                gsap.fromTo(
                    fillRef.value,
                    { width: `${oldValue}%` },
                    {
                        width: `${newValue}%`,
                        duration: props.animationDuration,
                        ease: EASING.EASE_OUT
                    }
                );
            } catch (error) {
                console.error('[ProgressBar] Animation error:', error);

                // Fallback to direct style update
                if (fillRef.value) {
                    fillRef.value.style.width = `${newValue}%`;
                }
            }
        };

        // Watch for value changes to animate
        watch(
            effectiveValue,
            (newVal, oldVal) => {
                if (oldVal !== newVal) {
                    animateProgress(oldVal, newVal);
                }
            }
        );

        // Initialize animation on mount
        onMounted(() => {
            try {
                // Initial animation from 0
                if (props.animateChanges && effectiveValue.value > 0) {
                    animateProgress(0, effectiveValue.value);
                }
            } catch (error) {
                console.error('[ProgressBar] Mount error:', error);
            }
        });

        return {
            trackRef,
            fillRef,
            isStepProgress,
            effectiveValue,
            fillStyle
        };
    }
});
</script>

<style lang="scss" scoped>
.progress-bar {
    width: 100%;
    margin: 12px 0;

    // Variant colors
    &--primary {
        --progress-color: var(--ion-color-primary);
        --progress-text: var(--ion-color-primary-contrast);
    }

    &--secondary {
        --progress-color: var(--ion-color-secondary);
        --progress-text: var(--ion-color-secondary-contrast);
    }

    &--success {
        --progress-color: var(--ion-color-success);
        --progress-text: var(--ion-color-success-contrast);
    }

    &--warning {
        --progress-color: var(--ion-color-warning);
        --progress-text: var(--ion-color-warning-contrast);
    }

    &--danger {
        --progress-color: var(--ion-color-danger);
        --progress-text: var(--ion-color-danger-contrast);
    }

    &--info {
        --progress-color: var(--ion-color-medium);
        --progress-text: var(--ion-color-medium-contrast);
    }

    // Header part
    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        font-size: 14px;
    }

    &__label {
        font-weight: 500;
        color: var(--ion-text-color);
    }

    &__percentage {
        font-weight: 600;
        color: var(--progress-color);
    }

    // Main progress track
    &__track {
        position: relative;
        width: 100%;
        background-color: rgba(var(--ion-color-medium-rgb), 0.2);
        border-radius: 4px;
        overflow: hidden;
    }

    &__fill {
        position: relative;
        width: 0;
        height: 8px;
        /* Default height, overridden by inline style */
        background-color: var(--progress-color);
        transition: width 0.4s ease;
        will-change: width;

        // Striped effect
        .progress-bar--striped & {
            background-image: linear-gradient(45deg,
                    rgba(255, 255, 255, 0.15) 25%,
                    transparent 25%,
                    transparent 50%,
                    rgba(255, 255, 255, 0.15) 50%,
                    rgba(255, 255, 255, 0.15) 75%,
                    transparent 75%,
                    transparent);
            background-size: 40px 40px;
        }

        // Animated striped effect
        .progress-bar--animated.progress-bar--striped & {
            animation: progress-bar-stripes 1s linear infinite;
        }
    }

    // Pulse effect at the edge of the progress bar
    &__pulse {
        position: absolute;
        top: 0;
        right: 0;
        width: 10px;
        height: 100%;
        background: rgba(255, 255, 255, 0.3);
        filter: blur(3px);
        animation: progress-bar-pulse 1.5s ease-in-out infinite;
    }

    // Step markers for step progress
    &__steps {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
    }

    &__step {
        position: absolute;
        transform: translateX(-50%);

        &--active .progress-bar__step-marker {
            background-color: var(--progress-color);
            border-color: var(--progress-color);
        }

        &--current .progress-bar__step-marker {
            box-shadow: 0 0 0 3px rgba(var(--ion-color-primary-rgb), 0.3);
        }
    }

    &__step-marker {
        width: 16px;
        height: 16px;
        background-color: var(--ion-color-light);
        border: 2px solid var(--ion-color-medium);
        border-radius: 50%;
        z-index: 10;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
    }

    &__step-label {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: 8px;
        white-space: nowrap;
        font-size: 12px;
        color: var(--ion-text-color);
        font-weight: 500;

        .progress-bar__step--active & {
            color: var(--progress-color);
        }
    }

    // Extra spacing for step labels
    &--with-steps {
        margin-bottom: 30px;

        &.progress-bar--labeled {
            margin-bottom: 50px;
        }
    }

    // Description text
    &__description {
        margin-top: 8px;
        font-size: 12px;
        color: var(--ion-color-medium);
    }
}

// Animation keyframes
@keyframes progress-bar-stripes {
    from {
        background-position: 40px 0;
    }

    to {
        background-position: 0 0;
    }
}

@keyframes progress-bar-pulse {
    0% {
        opacity: 0.6;
        width: 4px;
    }

    50% {
        opacity: 0.8;
        width: 8px;
    }

    100% {
        opacity: 0.6;
        width: 4px;
    }
}
</style>