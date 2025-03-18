<template>
    <div class="testimonial-slider">
        <!-- Navigation controls -->
        <div class="testimonial-controls">
            <button class="control-button" :class="{ 'disabled': currentIndex === 0 }" @click="prevSlide"
                :disabled="currentIndex === 0">
                <ion-icon :icon="chevronBackOutline"></ion-icon>
            </button>
            <div class="indicators">
                <button v-for="(_, index) in testimonials" :key="`indicator-${index}`" class="indicator-dot"
                    :class="{ 'active': currentIndex === index }" @click="goToSlide(index)"></button>
            </div>
            <button class="control-button" :class="{ 'disabled': currentIndex === testimonials.length - 1 }"
                @click="nextSlide" :disabled="currentIndex === testimonials.length - 1">
                <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </button>
        </div>

        <!-- Testimonial cards container -->
        <div class="testimonial-container" ref="sliderContainer">
            <div class="testimonial-track" :style="trackStyle" ref="sliderTrack">
                <div v-for="(testimonial, index) in testimonials" :key="`testimonial-${testimonial.id || index}`"
                    class="testimonial-card" :class="{ 'active': currentIndex === index }" ref="testimonialCards">
                    <div class="testimonial-card__content">
                        <div class="testimonial-card__quote-icon">
                            <ion-icon :icon="quoteIcon"></ion-icon>
                        </div>
                        <p class="testimonial-card__quote">{{ testimonial.quote }}</p>
                        <div class="testimonial-card__rating">
                            <div class="stars">
                                <ion-icon v-for="star in 5" :key="`star-${star}`"
                                    :icon="star <= testimonial.rating ? filledStarIcon : emptyStarIcon"
                                    class="star-icon"></ion-icon>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial-card__footer">
                        <div class="testimonial-card__avatar">
                            <img :src="testimonial.image || defaultAvatar" :alt="`${testimonial.name}'s profile`"
                                @error="handleImageError" />
                        </div>
                        <div class="testimonial-card__author">
                            <div class="testimonial-card__name">{{ testimonial.name }}</div>
                            <div class="testimonial-card__position">
                                {{ testimonial.position }}
                                <span v-if="testimonial.company">at {{ testimonial.company }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch, PropType } from 'vue';
import { IonIcon } from '@ionic/vue';
import {
    chevronBackOutline,
    chevronForwardOutline,
    starOutline,
    star,
    chatbubbleOutline
} from 'ionicons/icons';
import gsap from 'gsap';
import { ANIMATION_TIMING, EASING } from '@/utils/animations';

// Default image if testimonial image fails to load
import defaultAvatarImg from '@/assets/images/default-avatar.svg';

interface Testimonial {
    id?: number | string;
    name: string;
    position: string;
    company?: string;
    image?: string;
    quote: string;
    rating: number;
}

export default defineComponent({
    name: 'TestimonialSlider',
    components: {
        IonIcon
    },
    props: {
        testimonials: {
            type: Array as PropType<Testimonial[]>,
            required: true
        },
        autoplay: {
            type: Boolean,
            default: true
        },
        autoplayInterval: {
            type: Number,
            default: 5000 // 5 seconds
        },
        loop: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const currentIndex = ref(0);
        const sliderContainer = ref<HTMLElement | null>(null);
        const sliderTrack = ref<HTMLElement | null>(null);
        const testimonialCards = ref<HTMLElement[]>([]);
        const isAnimating = ref(false);

        // Default avatar for when image fails to load
        const defaultAvatar = defaultAvatarImg;

        // Icons
        const chevronBackOutline = chevronBackOutline;
        const chevronForwardOutline = chevronForwardOutline;
        const emptyStarIcon = starOutline;
        const filledStarIcon = star;
        const quoteIcon = chatbubbleOutline;

        // Autoplay interval ID
        let autoplayTimer: number | null = null;

        // Compute track transform style based on current index
        const trackStyle = computed(() => {
            return {
                transform: `translateX(-${currentIndex.value * 100}%)`,
                transition: isAnimating.value ? 'transform 0.5s ease-in-out' : 'none'
            };
        });

        // Navigate to previous slide
        const prevSlide = () => {
            if (isAnimating.value || currentIndex.value <= 0) return;

            isAnimating.value = true;
            currentIndex.value--;

            animateSlide();
            resetAutoplay();
        };

        // Navigate to next slide
        const nextSlide = () => {
            if (isAnimating.value || currentIndex.value >= props.testimonials.length - 1) return;

            isAnimating.value = true;
            currentIndex.value++;

            animateSlide();
            resetAutoplay();
        };

        // Go to a specific slide
        const goToSlide = (index: number) => {
            if (isAnimating.value || index === currentIndex.value) return;

            isAnimating.value = true;
            currentIndex.value = index;

            animateSlide();
            resetAutoplay();
        };

        // Animate the transition between slides
        const animateSlide = () => {
            const cards = testimonialCards.value;
            if (!cards || cards.length === 0) {
                isAnimating.value = false;
                return;
            }

            // Use GSAP for smoother animations
            gsap.to(sliderTrack.value, {
                x: `-${currentIndex.value * 100}%`,
                duration: ANIMATION_TIMING.MEDIUM,
                ease: EASING.EASE_IN_OUT,
                onComplete: () => {
                    isAnimating.value = false;
                }
            });

            // Animate the active card
            const activeCard = cards[currentIndex.value];
            if (activeCard) {
                gsap.fromTo(
                    activeCard,
                    {
                        opacity: 0,
                        y: 20
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: ANIMATION_TIMING.MEDIUM,
                        ease: EASING.EASE_OUT,
                        delay: 0.1
                    }
                );
            }
        };

        // Start autoplay if enabled
        const startAutoplay = () => {
            if (!props.autoplay) return;

            stopAutoplay();

            autoplayTimer = window.setInterval(() => {
                if (currentIndex.value < props.testimonials.length - 1) {
                    nextSlide();
                } else if (props.loop) {
                    // Reset to first slide if loop is enabled
                    goToSlide(0);
                }
            }, props.autoplayInterval);
        };

        // Stop autoplay
        const stopAutoplay = () => {
            if (autoplayTimer !== null) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        };

        // Reset autoplay timer
        const resetAutoplay = () => {
            stopAutoplay();
            startAutoplay();
        };

        // Handle image loading errors
        const handleImageError = (event: Event) => {
            const img = event.target as HTMLImageElement;
            img.src = defaultAvatar;
        };

        // Initialize the slider on mount
        onMounted(() => {
            startAutoplay();

            // Initial animation for the first card
            const firstCard = testimonialCards.value[0];
            if (firstCard) {
                gsap.fromTo(
                    firstCard,
                    {
                        opacity: 0,
                        y: 20
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: ANIMATION_TIMING.MEDIUM,
                        ease: EASING.EASE_OUT
                    }
                );
            }

            // Pause autoplay when user interacts with the slider
            sliderContainer.value?.addEventListener('mouseenter', stopAutoplay);
            sliderContainer.value?.addEventListener('mouseleave', startAutoplay);
        });

        // Clean up on unmount
        onBeforeUnmount(() => {
            stopAutoplay();

            // Remove event listeners
            sliderContainer.value?.removeEventListener('mouseenter', stopAutoplay);
            sliderContainer.value?.removeEventListener('mouseleave', startAutoplay);
        });

        // Watch for testimonials changes
        watch(() => props.testimonials, () => {
            // Reset slider when testimonials change
            currentIndex.value = 0;
            isAnimating.value = false;
            resetAutoplay();
        });

        return {
            currentIndex,
            sliderContainer,
            sliderTrack,
            testimonialCards,
            isAnimating,
            trackStyle,
            prevSlide,
            nextSlide,
            goToSlide,
            defaultAvatar,
            handleImageError,
            chevronBackOutline,
            chevronForwardOutline,
            emptyStarIcon,
            filledStarIcon,
            quoteIcon
        };
    }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

.testimonial-slider {
    position: relative;
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
}

.testimonial-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-lg;
}

.control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid $gray-200;
    color: var(--ion-color-dark);
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(.disabled) {
        background-color: var(--ion-color-primary);
        border-color: var(--ion-color-primary);
        color: #fff;
    }

    &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.indicators {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 $spacing-md;
}

.indicator-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: $gray-300;
    margin: 0 $spacing-xxs;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
        width: 12px;
        height: 12px;
        background-color: var(--ion-color-primary);
    }

    &:hover:not(.active) {
        background-color: $gray-400;
    }
}

.testimonial-container {
    position: relative;
    width: 100%;
    overflow: hidden;
}

.testimonial-track {
    display: flex;
    transition: transform 0.5s ease-in-out;
    width: 100%;
}

.testimonial-card {
    flex: 0 0 100%;
    padding: $spacing-md;
    opacity: 0.5;
    transition: opacity 0.5s ease;

    &.active {
        opacity: 1;
    }

    @media (min-width: $breakpoint-md) {
        padding: $spacing-lg;
    }

    &__content {
        background-color: #fff;
        border-radius: $border-radius-lg;
        padding: $spacing-xl;
        margin-bottom: $spacing-md;
        box-shadow: $shadow-md;
        position: relative;

        &::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 30px;
            width: 20px;
            height: 20px;
            background-color: #fff;
            transform: rotate(45deg);
            box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.05);
        }
    }

    &__quote-icon {
        color: var(--ion-color-primary);
        font-size: 1.5rem;
        margin-bottom: $spacing-md;
        opacity: 0.5;
    }

    &__quote {
        font-size: 1.125rem;
        line-height: 1.6;
        color: $gray-700;
        font-style: italic;
        margin-bottom: $spacing-md;
    }

    &__rating {
        display: flex;
        align-items: center;
        margin-bottom: $spacing-sm;

        .stars {
            display: flex;
        }

        .star-icon {
            color: #FFD700;
            margin-right: 2px;
            font-size: 1.25rem;
        }
    }

    &__footer {
        display: flex;
        align-items: center;
        padding-left: $spacing-lg;
    }

    &__avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: $spacing-md;
        border: 2px solid #fff;
        box-shadow: $shadow-sm;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    &__author {
        display: flex;
        flex-direction: column;
    }

    &__name {
        font-weight: $font-weight-semibold;
        font-size: 1.125rem;
        color: var(--ion-color-dark);
        margin-bottom: 2px;
    }

    &__position {
        font-size: 0.875rem;
        color: $gray-600;
    }
}

// Responsive adjustments
@media (min-width: $breakpoint-lg) {
    .testimonial-slider {
        max-width: 800px;
    }
}
</style>