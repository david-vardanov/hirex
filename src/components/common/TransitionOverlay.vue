<style lang="scss" scoped>
.transition-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.7);
    opacity: 0;
    pointer-events: none;

    &--active {
        pointer-events: auto;
    }

    &__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    &__spinner {
        width: 50px;
        height: 50px;
    }
}
</style><template>
    <div class="transition-overlay" :class="{ 'transition-overlay--active': active }" ref="overlayRef">
        <div class="transition-overlay__content">
            <ion-spinner name="crescent" color="light" class="transition-overlay__spinner"></ion-spinner>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { IonSpinner } from '@ionic/vue';
import gsap from 'gsap';
import { ANIMATION_TIMING, EASING } from '@/utils/animations';

export default defineComponent({
    name: 'TransitionOverlay',
    components: {
        IonSpinner
    },
    props: {
        active: {
            type: Boolean,
            default: true
        },
        timeout: {
            type: Number,
            default: 3000 // Safety timeout to prevent overlay stuck
        }
    },
    setup(props) {
        const overlayRef = ref<HTMLElement | null>(null);
        let timeoutId: number | undefined;
        let animation: gsap.core.Tween | null = null;

        /**
         * Initialize the overlay animation with error handling
         * Creates a fade-in animation for the overlay
         */
        const initAnimation = () => {
            try {
                if (!overlayRef.value) {
                    console.warn('[TransitionOverlay] Element reference is missing during animation init');
                    return;
                }

                // Kill any existing animation to prevent conflicts
                if (animation) {
                    animation.kill();
                }

                // Configure the animation with proper easing and timing
                animation = gsap.fromTo(
                    overlayRef.value,
                    { opacity: 0 },
                    {
                        opacity: 1,
                        duration: ANIMATION_TIMING.STANDARD,
                        ease: EASING.PAGE_TRANSITION,
                        onComplete: () => {
                            // Safety timeout to prevent overlay getting stuck
                            initSafetyTimeout();
                        }
                    }
                );

                // Pause initially - will be controlled by watcher
                animation.pause();
            } catch (error) {
                console.error('[TransitionOverlay] Animation initialization error:', error);
                // Fallback to basic CSS transition if GSAP fails
                if (overlayRef.value) {
                    overlayRef.value.style.transition = 'opacity 0.4s ease';
                    overlayRef.value.style.opacity = '1';
                }
            }
        };

        /**
         * Set a safety timeout to auto-hide the overlay if it stays visible too long
         * Prevents UI getting stuck in a loading state
         */
        const initSafetyTimeout = () => {
            try {
                // Clear any existing timeout to prevent duplicates
                if (timeoutId) {
                    window.clearTimeout(timeoutId);
                }

                // Set new timeout
                timeoutId = window.setTimeout(() => {
                    console.warn(`[TransitionOverlay] Safety timeout triggered after ${props.timeout}ms`);
                    hideOverlay();
                }, props.timeout);
            } catch (error) {
                console.error('[TransitionOverlay] Safety timeout initialization error:', error);
            }
        };

        /**
         * Show the overlay with animation
         */
        const showOverlay = () => {
            try {
                if (!animation) {
                    initAnimation();
                }

                if (animation) {
                    animation.play();
                } else {
                    // Fallback if animation wasn't created successfully
                    if (overlayRef.value) {
                        overlayRef.value.style.opacity = '1';
                    }
                }

                // Always set safety timeout
                initSafetyTimeout();
            } catch (error) {
                console.error('[TransitionOverlay] Show overlay error:', error);
                // Attempt to show overlay even if animation fails
                if (overlayRef.value) {
                    overlayRef.value.style.opacity = '1';
                }
            }
        };

        /**
         * Hide the overlay with animation
         */
        const hideOverlay = () => {
            try {
                // Clear safety timeout when hiding
                if (timeoutId) {
                    window.clearTimeout(timeoutId);
                    timeoutId = undefined;
                }

                if (animation) {
                    // Reverse the animation to hide
                    animation.reverse();
                } else {
                    // Fallback if animation wasn't created successfully
                    if (overlayRef.value) {
                        overlayRef.value.style.opacity = '0';
                    }
                }
            } catch (error) {
                console.error('[TransitionOverlay] Hide overlay error:', error);
                // Attempt to hide overlay even if animation fails
                if (overlayRef.value) {
                    overlayRef.value.style.opacity = '0';
                }
            }
        };

        // Initialize animation when component is mounted
        onMounted(() => {
            try {
                initAnimation();

                // Initial state based on active prop
                if (props.active) {
                    showOverlay();
                }
            } catch (error) {
                console.error('[TransitionOverlay] Mount error:', error);
            }
        });

        // Clean up resources when component is unmounted
        onBeforeUnmount(() => {
            try {
                // Kill animation and clear timeout to prevent memory leaks
                if (animation) {
                    animation.kill();
                    animation = null;
                }

                if (timeoutId) {
                    window.clearTimeout(timeoutId);
                    timeoutId = undefined;
                }
            } catch (error) {
                console.error('[TransitionOverlay] Unmount cleanup error:', error);
            }
        });

        // Watch for changes to the active prop
        watch(() => props.active, (isActive) => {
            try {
                isActive ? showOverlay() : hideOverlay();
            } catch (error) {
                console.error('[TransitionOverlay] Watch handler error:', error);
                // Attempt direct DOM manipulation as fallback
                if (overlayRef.value) {
                    overlayRef.value.style.opacity = isActive ? '1' : '0';
                }
            }
        });

        return {
            overlayRef
        };
    }
});
</script>