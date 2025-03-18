<style lang="scss" scoped>
.animated-background {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;

    // Variant-specific styles
    &--primary {
        background: var(--ion-color-primary);
        --element-color: rgba(255, 255, 255, 0.2);
    }

    &--secondary {
        background: var(--ion-color-secondary);
        --element-color: rgba(255, 255, 255, 0.2);
    }

    &--dark {
        background: var(--ion-color-dark);
        --element-color: rgba(255, 255, 255, 0.15);
    }

    &--light {
        background: var(--ion-color-light);
        --element-color: rgba(0, 0, 0, 0.1);
    }

    &--gradient {
        background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
        --element-color: rgba(255, 255, 255, 0.2);
    }

    // Floating elements
    &__element {
        position: absolute;
        border-radius: 50%; // Default for circles and dots
        will-change: transform, opacity;

        &--circle {
            background-color: var(--element-color);
            border-radius: 50%;
        }

        &--square {
            background-color: var(--element-color);
            border-radius: 4px;
        }

        &--triangle {
            // Style is set dynamically in the component
            // Uses border technique for triangles
        }

        &--dot {
            background-color: var(--element-color);
            border-radius: 50%;
            transform: scale(0.5); // Smaller than regular circles
        }
    }

    // Wave overlay
    &__waves {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 40%;
        overflow: hidden;
    }

    &__wave {
        position: absolute;
        width: 140%;
        height: 100%;
        background-repeat: repeat-x;
        background-position: 0 bottom;
        transform-origin: center bottom;

        &--1 {
            bottom: 0;
            height: 5%;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="%23FFFFFF" /></svg>');
            opacity: 0.3;
        }

        &--2 {
            bottom: 0;
            height: 10%;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" opacity=".25" fill="%23FFFFFF" /></svg>');
            opacity: 0.2;
            z-index: 1;
        }

        &--3 {
            bottom: 0;
            height: 15%;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z" opacity=".25" fill="%23FFFFFF" /></svg>');
            opacity: 0.1;
            z-index: 2;
        }
    }

    // Gradient overlay
    &__gradient {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 3;
        pointer-events: none;

        &--primary {
            background: radial-gradient(circle at 50% 10%, rgba(var(--ion-color-primary-rgb), 0) 0%, rgba(var(--ion-color-primary-rgb), 0.8) 100%);
        }

        &--secondary {
            background: radial-gradient(circle at 50% 10%, rgba(var(--ion-color-secondary-rgb), 0) 0%, rgba(var(--ion-color-secondary-rgb), 0.8) 100%);
        }

        &--dark {
            background: radial-gradient(circle at 50% 10%, rgba(var(--ion-color-dark-rgb), 0) 0%, rgba(var(--ion-color-dark-rgb), 0.8) 100%);
        }

        &--light {
            background: radial-gradient(circle at 50% 10%, rgba(var(--ion-color-light-rgb), 0) 0%, rgba(var(--ion-color-light-rgb), 0.8) 100%);
        }

        &--gradient {
            background: radial-gradient(circle at 50% 10%, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
        }
    }

    // Content slot
    &__content {
        position: relative;
        z-index: 5;
        height: 100%;
        width: 100%;
    }
}
</style>

<template>
    <div class="animated-background" :class="[`animated-background--${variant}`]" ref="backgroundRef">
        <!-- Floating elements -->
        <div v-for="(element, index) in floatingElements" :key="`floating-element-${index}`"
            class="animated-background__element" :class="[`animated-background__element--${element.type}`]"
            :style="element.style" ref="elementsRef"></div>

        <!-- Wave overlay -->
        <div class="animated-background__waves">
            <div class="animated-background__wave animated-background__wave--1"></div>
            <div class="animated-background__wave animated-background__wave--2"></div>
            <div class="animated-background__wave animated-background__wave--3"></div>
        </div>

        <!-- Gradient overlay -->
        <div class="animated-background__gradient" :class="[`animated-background__gradient--${variant}`]"></div>

        <!-- Content slot -->
        <div class="animated-background__content">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, PropType, watch } from 'vue';
import gsap from 'gsap';
import { ANIMATION_TIMING, EASING, animationController } from '@/utils/animations';

// Background variant types
type BackgroundVariant = 'primary' | 'secondary' | 'dark' | 'light' | 'gradient';

// Floating element types
type ElementType = 'circle' | 'square' | 'triangle' | 'dot';

// Element configuration
interface FloatingElement {
    type: ElementType;
    size: number;
    x: number;
    y: number;
    opacity: number;
    rotation: number;
    delay: number;
    duration: number;
    style: Record<string, string>;
}

export default defineComponent({
    name: 'AnimatedBackground',
    props: {
        variant: {
            type: String as PropType<BackgroundVariant>,
            default: 'primary',
            validator: (value: string) => {
                return ['primary', 'secondary', 'dark', 'light', 'gradient'].includes(value);
            }
        },
        elementCount: {
            type: Number,
            default: 15,
            validator: (value: number) => {
                return value >= 0 && value <= 50;
            }
        },
        animated: {
            type: Boolean,
            default: true
        },
        interactive: {
            type: Boolean,
            default: true
        },
        density: {
            type: Number,
            default: 1,
            validator: (value: number) => {
                return value >= 0.1 && value <= 2;
            }
        }
    },
    setup(props) {
        const backgroundRef = ref<HTMLElement | null>(null);
        const elementsRef = ref<HTMLElement[]>([]);
        const floatingElements = ref<FloatingElement[]>([]);

        // Animation IDs for cleanup
        const animationIds = {
            elements: 'background-elements',
            waves: 'background-waves',
            mouse: 'background-mouse'
        };

        // Interactive mouse tracking
        const mousePosition = {
            x: 0,
            y: 0,
            moving: false
        };

        /**
    * Generate random floating elements based on props
    */
        const generateElements = () => {
            try {
                const elements: FloatingElement[] = [];
                const count = Math.min(Math.max(props.elementCount, 0), 50);

                // Element type distribution
                const typeDistribution = [
                    { type: 'circle', weight: 0.4 },
                    { type: 'square', weight: 0.25 },
                    { type: 'triangle', weight: 0.15 },
                    { type: 'dot', weight: 0.2 }
                ];

                for (let i = 0; i < count; i++) {
                    // Randomly select element type based on distribution
                    const randomValue = Math.random();
                    let cumulativeWeight = 0;
                    let selectedType: ElementType = 'circle';

                    for (const { type, weight } of typeDistribution) {
                        cumulativeWeight += weight;
                        if (randomValue <= cumulativeWeight) {
                            selectedType = type as ElementType;
                            break;
                        }
                    }

                    // Randomize properties with constraints
                    const size = Math.floor(Math.random() * 40) + 10; // 10-50px
                    const x = Math.random() * 100; // 0-100%
                    const y = Math.random() * 100; // 0-100%
                    const opacity = (Math.random() * 0.5) + 0.1; // 0.1-0.6
                    const rotation = Math.floor(Math.random() * 360); // 0-360deg
                    const delay = Math.random() * 5; // 0-5s
                    const duration = (Math.random() * 20) + 15; // 15-35s

                    // Calculate z-index based on size for parallax effect
                    const zIndex = Math.floor((1 - (size / 50)) * 5);

                    // Generate element styles
                    const style: Record<string, string> = {
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${x}%`,
                        top: `${y}%`,
                        opacity: opacity.toString(),
                        transform: `rotate(${rotation}deg)`,
                        zIndex: zIndex.toString()
                    };

                    // For triangle, we need different dimensions
                    if (selectedType === 'triangle') {
                        style.width = '0';
                        style.height = '0';
                        style.borderLeft = `${size / 2}px solid transparent`;
                        style.borderRight = `${size / 2}px solid transparent`;
                        style.borderBottom = `${size}px solid var(--element-color)`;
                    }

                    elements.push({
                        type: selectedType,
                        size,
                        x,
                        y,
                        opacity,
                        rotation,
                        delay,
                        duration,
                        style
                    });
                }

                floatingElements.value = elements;
            } catch (error) {
                console.error('[AnimatedBackground] Element generation error:', error);
                // Fallback to empty array on error
                floatingElements.value = [];
            }
        };

        /**
         * Initialize animations for floating elements
         */
        const initElementAnimations = () => {
            try {
                if (!props.animated || elementsRef.value.length === 0) return;

                // Kill existing animations
                animationController.remove(animationIds.elements);

                // Create master timeline
                const master = gsap.timeline({
                    paused: true,
                    repeat: -1,
                    repeatDelay: 0.5
                });

                // Animate each element individually
                elementsRef.value.forEach((el, index) => {
                    if (index >= floatingElements.value.length) return;

                    const element = floatingElements.value[index];
                    const delay = element.delay;
                    const duration = element.duration;

                    // Create random movement and rotation animation
                    const tl = gsap.timeline({ repeat: -1, yoyo: true });

                    // Random target position within constraints
                    const xMovement = Math.random() * 20 - 10; // -10% to +10%
                    const yMovement = Math.random() * 20 - 10; // -10% to +10%

                    // Animated properties
                    tl.to(el, {
                        x: `${xMovement}%`,
                        y: `${yMovement}%`,
                        rotation: `+=${Math.random() > 0.5 ? 90 : -90}`,
                        opacity: (Math.random() * 0.3) + 0.2,
                        duration,
                        ease: EASING.EASE_IN_OUT,
                        delay
                    });

                    // Add to master timeline
                    master.add(tl, 0);
                });

                // Register with animation controller
                animationController.register(animationIds.elements, master);

                // Play animation
                animationController.play(animationIds.elements);
            } catch (error) {
                console.error('[AnimatedBackground] Element animation initialization error:', error);
            }
        };

        /**
         * Initialize wave animations
         */
        const initWaveAnimations = () => {
            try {
                if (!props.animated || !backgroundRef.value) return;

                // Kill existing animations
                animationController.remove(animationIds.waves);

                // Select wave elements
                const waves = backgroundRef.value.querySelectorAll('.animated-background__wave');
                if (waves.length === 0) return;

                // Create master timeline
                const master = gsap.timeline({
                    paused: true,
                    repeat: -1,
                    repeatDelay: 0
                });

                // Animate each wave with different parameters
                waves.forEach((wave, index) => {
                    const duration = 7 + (index * 1.5); // Increasing duration for each wave
                    const delay = index * 0.5; // Staggered start

                    const tl = gsap.timeline({ repeat: -1, yoyo: true });

                    tl.to(wave, {
                        x: '-20%',
                        duration,
                        ease: EASING.EASE_IN_OUT,
                        delay
                    });

                    master.add(tl, 0);
                });

                // Register with animation controller
                animationController.register(animationIds.waves, master);

                // Play animation
                animationController.play(animationIds.waves);
            } catch (error) {
                console.error('[AnimatedBackground] Wave animation initialization error:', error);
            }
        };

        /**
         * Initialize interactive mouse movement
         */
        const initMouseInteraction = () => {
            try {
                if (!props.interactive || !backgroundRef.value) return;

                // Kill existing animations
                animationController.remove(animationIds.mouse);

                // Mouse move handler
                const handleMouseMove = (e: MouseEvent) => {
                    // Get container position
                    const rect = backgroundRef.value?.getBoundingClientRect();
                    if (!rect) return;

                    // Calculate relative position (0-1)
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;

                    // Update stored position
                    mousePosition.x = x;
                    mousePosition.y = y;
                    mousePosition.moving = true;

                    // Apply parallax effect to elements
                    updateElementsParallax();
                };

                // Add event listener
                backgroundRef.value.addEventListener('mousemove', handleMouseMove);

                // Store the removal function for cleanup
                const removeListener = () => {
                    backgroundRef.value?.removeEventListener('mousemove', handleMouseMove);
                };

                // Register dummy timeline to store cleanup
                const dummy = gsap.timeline({
                    paused: true,
                    onComplete: removeListener
                });

                // Register with animation controller
                animationController.register(animationIds.mouse, dummy);
            } catch (error) {
                console.error('[AnimatedBackground] Mouse interaction initialization error:', error);
            }
        };

        /**
         * Update elements position based on mouse position
         */
        const updateElementsParallax = () => {
            try {
                if (!mousePosition.moving || elementsRef.value.length === 0) return;

                // Calculate center offset
                const offsetX = (mousePosition.x - 0.5) * 2; // -1 to 1
                const offsetY = (mousePosition.y - 0.5) * 2; // -1 to 1

                // Apply different movement amounts based on z-index for parallax
                elementsRef.value.forEach((el, index) => {
                    if (index >= floatingElements.value.length) return;

                    const element = floatingElements.value[index];
                    const parallaxAmount = 1 - (element.size / 60); // Smaller elements move more
                    const moveX = offsetX * 20 * parallaxAmount * props.density;
                    const moveY = offsetY * 20 * parallaxAmount * props.density;

                    // Apply with GSAP for smooth movement
                    gsap.to(el, {
                        x: `${moveX}px`,
                        y: `${moveY}px`,
                        rotation: `${element.rotation + (offsetX * 10)}deg`,
                        duration: 1,
                        ease: EASING.EASE_OUT
                    });
                });
            } catch (error) {
                console.error('[AnimatedBackground] Parallax update error:', error);
            }
        };

        /**
         * Initialize all animations
         */
        const initAnimations = () => {
            try {
                // Wait for next tick to ensure refs are populated
                setTimeout(() => {
                    initElementAnimations();
                    initWaveAnimations();
                    initMouseInteraction();
                }, 0);
            } catch (error) {
                console.error('[AnimatedBackground] Animation initialization error:', error);
            }
        };

        /**
         * Cleanup all animations
         */
        const cleanupAnimations = () => {
            try {
                animationController.remove(animationIds.elements);
                animationController.remove(animationIds.waves);
                animationController.remove(animationIds.mouse);
            } catch (error) {
                console.error('[AnimatedBackground] Animation cleanup error:', error);
            }
        };

        // Generate elements on component creation
        generateElements();

        // Initialize animations when component is mounted
        onMounted(() => {
            initAnimations();
        });

        // Clean up animations when component is unmounted
        onBeforeUnmount(() => {
            cleanupAnimations();
        });

        // Watch for property changes
        watch(
            [
                () => props.animated,
                () => props.interactive,
                () => props.elementCount,
                () => props.density
            ],
            () => {
                // Clean up existing animations
                cleanupAnimations();

                // Regenerate elements if count changed
                if (props.elementCount !== floatingElements.value.length) {
                    generateElements();
                }

                // Reinitialize animations
                initAnimations();
            }
        );

        return {
            backgroundRef,
            elementsRef,
            floatingElements
        };
    }
});
</script>