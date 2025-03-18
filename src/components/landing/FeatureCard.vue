<template>
    <ion-page>
        <ion-header class="ion-no-border" translucent>
            <ion-toolbar>
                <div class="landing-header">
                    <div class="landing-logo">
                        <img src="@/assets/images/logo.svg" alt="Logo" class="logo-image" />
                        <span class="logo-text">JobMatch</span>
                    </div>

                    <ion-buttons slot="end" class="landing-nav">
                        <a href="#features" class="nav-link">Features</a>
                        <a href="#how-it-works" class="nav-link">How It Works</a>
                        <a href="#testimonials" class="nav-link">Testimonials</a>
                        <app-button size="small" variant="secondary" @click="navigateToLogin">
                            Log In
                        </app-button>
                    </ion-buttons>

                    <!-- Mobile menu button -->
                    <ion-button fill="clear" class="menu-button d-md-none" @click="toggleMobileMenu">
                        <ion-icon :icon="menuIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                </div>
            </ion-toolbar>
        </ion-header>

        <!-- Mobile menu drawer -->
        <div class="mobile-menu-overlay" :class="{ 'is-active': mobileMenuOpen }" @click="closeMobileMenu"></div>
        <div class="mobile-menu" :class="{ 'is-active': mobileMenuOpen }">
            <div class="mobile-menu__header">
                <div class="landing-logo">
                    <img src="@/assets/images/logo.svg" alt="Logo" class="logo-image" />
                    <span class="logo-text">JobMatch</span>
                </div>
                <ion-button fill="clear" @click="closeMobileMenu">
                    <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
                </ion-button>
            </div>
            <div class="mobile-menu__links">
                <a href="#features" class="mobile-nav-link" @click="closeMobileMenu">Features</a>
                <a href="#how-it-works" class="mobile-nav-link" @click="closeMobileMenu">How It Works</a>
                <a href="#testimonials" class="mobile-nav-link" @click="closeMobileMenu">Testimonials</a>
                <app-button class="mt-lg" block variant="secondary" @click="navigateToLogin">
                    Log In
                </app-button>
                <app-button class="mt-md" block @click="navigateToRegister">
                    Create Account
                </app-button>
            </div>
        </div>

        <ion-content fullscreen>
            <!-- Hero Section -->
            <section class="hero-section" id="hero">
                <animated-background variant="gradient">
                    <div class="content-container hero-content">
                        <div class="hero-text animate-slide-in-left">
                            <h1 class="hero-title">Find Your Dream Job with Confidence</h1>
                            <p class="hero-subtitle">
                                Know exactly where you stand in the hiring process.
                                No more waiting in uncertainty - get real-time updates on your application.
                            </p>
                            <div class="hero-cta">
                                <app-button size="large" @click="navigateToRegister" leftIcon="person-add-outline">
                                    Create Your Profile
                                </app-button>
                                <app-button size="large" variant="light" @click="scrollToSection('how-it-works')"
                                    leftIcon="information-circle-outline">
                                    How It Works
                                </app-button>
                            </div>
                        </div>
                        <div class="hero-image animate-fade-in animation-delay-300">
                            <img src="@/assets/images/hero-image.svg" alt="Candidate Platform" />
                        </div>
                    </div>
                </animated-background>
            </section>

            <!-- Stats Section -->
            <section class="stats-section animate-fade-in">
                <div class="content-container">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">2,500+</div>
                            <div class="stat-label">Companies</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">50,000+</div>
                            <div class="stat-label">Candidates</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">85%</div>
                            <div class="stat-label">Interview Rate</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">30%</div>
                            <div class="stat-label">Faster Hiring</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section class="features-section" id="features">
                <div class="content-container">
                    <div class="section-header stagger-children stagger-fade-in">
                        <h2 class="section-title">Features Designed for You</h2>
                        <p class="section-subtitle">
                            Our platform offers transparency and control throughout your job application journey
                        </p>
                    </div>

                    <div class="features-grid">
                        <feature-card title="Real-time Status Updates"
                            description="Always know where you stand in the application process with instant notifications."
                            icon="time-outline" />
                        <feature-card title="Interview Scheduling"
                            description="Schedule interviews directly in the platform and receive reminders."
                            icon="calendar-outline" />
                        <feature-card title="Document Management"
                            description="Upload and manage your CV, portfolio, and other documents in one place."
                            icon="document-text-outline" />
                        <feature-card title="Feedback Collection"
                            description="Receive constructive feedback from recruiters to improve your profile."
                            icon="chatbubble-outline" />
                        <feature-card title="Application Timeline"
                            description="Visualize your application journey and upcoming steps in an interactive timeline."
                            icon="analytics-outline" />
                        <feature-card title="Direct Messaging"
                            description="Communicate directly with recruiters to clarify questions and details."
                            icon="mail-outline" />
                    </div>
                </div>
            </section>

            <!-- How It Works -->
            <section class="how-it-works-section" id="how-it-works">
                <div class="content-container">
                    <div class="section-header">
                        <h2 class="section-title">How It Works</h2>
                        <p class="section-subtitle">
                            Four simple steps to finding your perfect job match
                        </p>
                    </div>

                    <div class="steps-container">
                        <div class="step-card" v-for="(step, index) in steps" :key="`step-${index}`">
                            <div class="step-number">{{ index + 1 }}</div>
                            <div class="step-content">
                                <h3 class="step-title">{{ step.title }}</h3>
                                <p class="step-description">{{ step.description }}</p>
                            </div>
                            <div class="step-icon">
                                <ion-icon :icon="step.icon"></ion-icon>
                            </div>
                        </div>

                        <div class="step-connector"></div>
                    </div>
                </div>
            </section>

            <!-- Testimonials Section -->
            <section class="testimonials-section" id="testimonials">
                <div class="content-container">
                    <div class="section-header">
                        <h2 class="section-title">What Our Users Say</h2>
                        <p class="section-subtitle">
                            Success stories from candidates who found their dream jobs
                        </p>
                    </div>

                    <testimonial-slider :testimonials="testimonials" />
                </div>
            </section>

            <!-- CTA Section -->
            <section class="cta-section">
                <animated-background variant="primary" :element-count="8">
                    <div class="content-container">
                        <div class="cta-content">
                            <h2 class="cta-title">Ready to take control of your job search?</h2>
                            <p class="cta-subtitle">
                                Create your profile today and experience a transparent hiring process.
                            </p>
                            <app-button size="large" variant="light" @click="navigateToRegister">
                                Get Started Now
                            </app-button>
                        </div>
                    </div>
                </animated-background>
            </section>

            <!-- Footer -->
            <footer class="landing-footer">
                <div class="content-container">
                    <div class="footer-grid">
                        <div class="footer-brand">
                            <div class="landing-logo">
                                <img src="@/assets/images/logo.svg" alt="Logo" class="logo-image" />
                                <span class="logo-text">JobMatch</span>
                            </div>
                            <p class="footer-tagline">
                                Connecting talented candidates with great opportunities.
                            </p>
                            <div class="social-links">
                                <a href="#" class="social-link">
                                    <ion-icon name="logo-linkedin"></ion-icon>
                                </a>
                                <a href="#" class="social-link">
                                    <ion-icon name="logo-twitter"></ion-icon>
                                </a>
                                <a href="#" class="social-link">
                                    <ion-icon name="logo-facebook"></ion-icon>
                                </a>
                                <a href="#" class="social-link">
                                    <ion-icon name="logo-instagram"></ion-icon>
                                </a>
                            </div>
                        </div>

                        <div class="footer-links">
                            <div class="footer-link-group">
                                <h4 class="footer-link-title">Platform</h4>
                                <a href="#features" class="footer-link">Features</a>
                                <a href="#how-it-works" class="footer-link">How It Works</a>
                                <a href="#testimonials" class="footer-link">Testimonials</a>
                                <a href="#" class="footer-link">Pricing</a>
                            </div>

                            <div class="footer-link-group">
                                <h4 class="footer-link-title">Company</h4>
                                <a href="#" class="footer-link">About Us</a>
                                <a href="#" class="footer-link">Careers</a>
                                <a href="#" class="footer-link">Blog</a>
                                <a href="#" class="footer-link">Press</a>
                            </div>

                            <div class="footer-link-group">
                                <h4 class="footer-link-title">Resources</h4>
                                <a href="#" class="footer-link">Support</a>
                                <a href="#" class="footer-link">Contact</a>
                                <a href="#" class="footer-link">Privacy Policy</a>
                                <a href="#" class="footer-link">Terms of Service</a>
                            </div>
                        </div>
                    </div>

                    <div class="footer-bottom">
                        <p class="copyright">© 2023 JobMatch. All rights reserved.</p>
                        <div class="footer-legal">
                            <a href="#" class="legal-link">Privacy Policy</a>
                            <a href="#" class="legal-link">Terms of Service</a>
                            <a href="#" class="legal-link">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { useRouter } from 'vue-router';
import {
    menuOutline,
    closeOutline,
    timeOutline,
    calendarOutline,
    documentTextOutline,
    chatbubbleOutline,
    analyticsOutline,
    mailOutline,
    personOutline,
    briefcaseOutline,
    checkmarkCircleOutline,
    rocketOutline
} from 'ionicons/icons';

// Import custom components
import AppButton from '@/components/common/Button.vue';
import AnimatedBackground from '@/components/common/AnimatedBackground.vue';
import FeatureCard from '@/components/landing/FeatureCard.vue';
import TestimonialSlider from '@/components/landing/TestimonialSlider.vue';

export default defineComponent({
    name: 'LandingPage',
    components: {
        IonPage,
        IonHeader,
        IonToolbar,
        IonContent,
        IonButtons,
        IonButton,
        IonIcon,
        AppButton,
        AnimatedBackground,
        FeatureCard,
        TestimonialSlider
    },
    setup() {
        const router = useRouter();
        const mobileMenuOpen = ref(false);

        // Step data
        const steps = [
            {
                title: 'Create Your Profile',
                description: 'Sign up and build your professional profile with your skills, experience, and job preferences.',
                icon: personOutline
            },
            {
                title: 'Apply to Jobs',
                description: 'Browse available positions that match your skills and apply with just a few clicks.',
                icon: briefcaseOutline
            },
            {
                title: 'Track Your Progress',
                description: 'Get real-time updates on your application status and upcoming interviews.',
                icon: checkmarkCircleOutline
            },
            {
                title: 'Land Your Dream Job',
                description: 'Receive offers and accept the position that best fits your career goals.',
                icon: rocketOutline
            }
        ];

        // Testimonial data
        const testimonials = [
            {
                id: 1,
                name: 'Sarah Johnson',
                position: 'Software Developer',
                company: 'TechCorp',
                image: '@/assets/images/testimonials/testimonial-1.jpg',
                quote: 'The transparency of the platform was a game-changer for me. I could see exactly where I was in the hiring process, which eliminated the anxiety of waiting for feedback.',
                rating: 5
            },
            {
                id: 2,
                name: 'Michael Chen',
                position: 'Marketing Manager',
                company: 'Brandify',
                image: '@/assets/images/testimonials/testimonial-2.jpg',
                quote: 'I love how I can schedule interviews directly through the platform. The reminders helped me prepare properly and I ended up getting the job!',
                rating: 5
            },
            {
                id: 3,
                name: 'Elena Rodriguez',
                position: 'UX Designer',
                company: 'DesignHub',
                image: '@/assets/images/testimonials/testimonial-3.jpg',
                quote: 'The feedback I received through JobMatch was invaluable. I could improve my portfolio based on real recruiter comments, which ultimately led to multiple job offers.',
                rating: 4
            }
        ];

        // Navigation methods
        const navigateToLogin = () => {
            router.push('/login');
        };

        const navigateToRegister = () => {
            router.push('/register');
        };

        // Mobile menu toggle
        const toggleMobileMenu = () => {
            mobileMenuOpen.value = !mobileMenuOpen.value;
            if (mobileMenuOpen.value) {
                document.body.classList.add('menu-open');
            } else {
                document.body.classList.remove('menu-open');
            }
        };

        const closeMobileMenu = () => {
            mobileMenuOpen.value = false;
            document.body.classList.remove('menu-open');
        };

        // Smooth scroll to section
        const scrollToSection = (sectionId: string) => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
            closeMobileMenu();
        };

        return {
            mobileMenuOpen,
            steps,
            testimonials,
            menuIcon: menuOutline,
            closeIcon: closeOutline,
            navigateToLogin,
            navigateToRegister,
            toggleMobileMenu,
            closeMobileMenu,
            scrollToSection
        };
    }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables.scss';

// Header Styles
.landing-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: $spacing-xs $spacing-md;
}

.landing-logo {
    display: flex;
    align-items: center;

    .logo-image {
        height: 32px;
        width: auto;
        margin-right: $spacing-xs;
    }

    .logo-text {
        font-size: 1.25rem;
        font-weight: $font-weight-bold;
        color: var(--ion-color-dark);
    }
}

.landing-nav {
    display: none;

    @media (min-width: $breakpoint-md) {
        display: flex;
        align-items: center;
    }

    .nav-link {
        margin-right: $spacing-lg;
        font-size: 1rem;
        font-weight: $font-weight-medium;
        color: var(--ion-color-dark);
        text-decoration: none;
        transition: color $transition-fast;

        &:hover {
            color: var(--ion-color-primary);
            text-decoration: none;
        }
    }
}

.menu-button {
    font-size: 1.5rem;
}

// Mobile Menu
.mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: $z-index-modal-backdrop;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;

    &.is-active {
        opacity: 1;
        visibility: visible;
    }
}

.mobile-menu {
    position: fixed;
    top: 0;
    right: 0;
    width: 80%;
    max-width: 320px;
    height: 100%;
    background-color: #fff;
    z-index: $z-index-modal;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow: $shadow-lg;

    &.is-active {
        transform: translateX(0);
    }

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $spacing-md;
        border-bottom: 1px solid $gray-200;
    }

    &__links {
        padding: $spacing-md;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }

    .mobile-nav-link {
        font-size: 1.125rem;
        font-weight: $font-weight-medium;
        color: var(--ion-color-dark);
        text-decoration: none;
        padding: $spacing-md 0;
        border-bottom: 1px solid $gray-100;
        transition: color $transition-fast;

        &:hover {
            color: var(--ion-color-primary);
        }
    }
}

// Add styles to prevent body scroll when menu is open
:global(body.menu-open) {
    overflow: hidden;
}

// Hero Section
.hero-section {
    min-height: 90vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    position: relative;
}

.hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-xl 0;

    @media (min-width: $breakpoint-md) {
        flex-direction: row;
        align-items: center;
        padding: $spacing-xxl 0;
    }
}

.hero-text {
    flex: 1;
    text-align: center;
    margin-bottom: $spacing-xl;

    @media (min-width: $breakpoint-md) {
        text-align: left;
        margin-bottom: 0;
        margin-right: $spacing-xl;
    }
}

.hero-title {
    font-size: 2.25rem;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-md;
    color: #fff;
    line-height: 1.2;

    @media (min-width: $breakpoint-md) {
        font-size: 3rem;
    }
}

.hero-subtitle {
    font-size: 1.125rem;
    margin-bottom: $spacing-lg;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;

    @media (min-width: $breakpoint-md) {
        font-size: 1.25rem;
    }
}

.hero-cta {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;

    @media (min-width: $breakpoint-sm) {
        flex-direction: row;
        justify-content: center;
    }

    @media (min-width: $breakpoint-md) {
        justify-content: flex-start;
    }
}

.hero-image {
    flex: 1;
    display: flex;
    justify-content: center;

    img {
        max-width: 100%;
        height: auto;
        max-height: 400px;

        @media (min-width: $breakpoint-md) {
            max-height: 500px;
        }
    }
}

// Stats Section
.stats-section {
    background-color: #fff;
    padding: $spacing-xl 0;
    border-bottom: 1px solid $gray-200;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;

    @media (min-width: $breakpoint-md) {
        grid-template-columns: repeat(4, 1fr);
    }
}

.stat-card {
    text-align: center;
    padding: $spacing-lg;

    .stat-number {
        font-size: 2rem;
        font-weight: $font-weight-bold;
        color: var(--ion-color-primary);
        margin-bottom: $spacing-xs;

        @media (min-width: $breakpoint-md) {
            font-size: 2.5rem;
        }
    }

    .stat-label {
        font-size: 1rem;
        color: $gray-600;
        font-weight: $font-weight-medium;
    }
}

// Section Styles
.section-header {
    text-align: center;
    margin-bottom: $spacing-xl;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

.section-title {
    font-size: 2rem;
    font-weight: $font-weight-bold;
    color: var(--ion-color-dark);
    margin-bottom: $spacing-md;

    @media (min-width: $breakpoint-md) {
        font-size: 2.5rem;
    }
}

.section-subtitle {
    font-size: 1.125rem;
    color: $gray-600;
    line-height: 1.6;
}

// Features Section
.features-section {
    padding: $spacing-xxl 0;
    background-color: $gray-50;
}

.features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-lg;

    @media (min-width: $breakpoint-sm) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: $breakpoint-lg) {
        grid-template-columns: repeat(3, 1fr);
    }
}

// How It Works Section
.how-it-works-section {
    padding: $spacing-xxl 0;
    background-color: #fff;
}

.steps-container {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
}

.step-card {
    display: flex;
    align-items: flex-start;
    margin-bottom: $spacing-xl;
    position: relative;
    z-index: 1;
    background-color: #fff;
    padding: $spacing-lg;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-md;

    @media (min-width: $breakpoint-md) {
        padding: $spacing-xl;
    }

    &:last-child {
        margin-bottom: 0;
    }
}

.step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: var(--ion-color-primary);
    color: #fff;
    border-radius: 50%;
    font-weight: $font-weight-bold;
    font-size: 1.25rem;
    margin-right: $spacing-md;
    flex-shrink: 0;

    @media (min-width: $breakpoint-md) {
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
    }
}

.step-content {
    flex-grow: 1;
}

.step-title {
    font-size: 1.25rem;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-xs;
    color: var(--ion-color-dark);

    @media (min-width: $breakpoint-md) {
        font-size: 1.5rem;
    }
}

.step-description {
    font-size: 1rem;
    color: $gray-600;
    line-height: 1.6;
}

.step-icon {
    margin-left: $spacing-md;
    flex-shrink: 0;
    font-size: 2rem;
    color: var(--ion-color-secondary);

    @media (min-width: $breakpoint-md) {
        font-size: 2.5rem;
    }
}

.step-connector {
    position: absolute;
    top: 20px;
    bottom: 20px;
    left: 20px;
    width: 2px;
    background-color: var(--ion-color-primary);
    z-index: 0;

    @media (min-width: $breakpoint-md) {
        left: 25px;
    }
}

// Testimonials Section
.testimonials-section {
    padding: $spacing-xxl 0;
    background-color: $gray-50;
}

// CTA Section
.cta-section {
    text-align: center;
    overflow: hidden;
}

.cta-content {
    padding: $spacing-xxl 0;
    color: #fff;
}

.cta-title {
    font-size: 2rem;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-md;

    @media (min-width: $breakpoint-md) {
        font-size: 2.5rem;
    }
}

.cta-subtitle {
    font-size: 1.125rem;
    margin-bottom: $spacing-lg;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    @media (min-width: $breakpoint-md) {
        font-size: 1.25rem;
    }
}

// Footer Styles
.landing-footer {
    background-color: $gray-900;
    color: $gray-300;
    padding: $spacing-xl 0 $spacing-lg;
}

.footer-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-xl;
    margin-bottom: $spacing-xl;

    @media (min-width: $breakpoint-md) {
        grid-template-columns: 1fr 2fr;
    }
}

.footer-brand {
    .landing-logo {
        margin-bottom: $spacing-md;

        .logo-text {
            color: #fff;
        }
    }
}

.footer-tagline {
    margin-bottom: $spacing-md;
    font-size: 1rem;
    line-height: 1.6;
}

.social-links {
    display: flex;
    gap: $spacing-md;
}

.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 1.25rem;
    transition: background-color $transition-fast;

    &:hover {
        background-color: var(--ion-color-primary);
    }
}

.footer-links {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: $spacing-xl;

    @media (min-width: $breakpoint-sm) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: $breakpoint-md) {
        grid-template-columns: repeat(3, 1fr);
    }
}

.footer-link-group {
    .footer-link-title {
        color: #fff;
        font-size: 1.125rem;
        font-weight: $font-weight-semibold;
        margin-bottom: $spacing-md;
    }

    .footer-link {
        display: block;
        color: $gray-400;
        text-decoration: none;
        margin-bottom: $spacing-sm;
        transition: color $transition-fast;

        &:hover {
            color: #fff;
        }
    }
}

.footer-bottom {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    @media (min-width: $breakpoint-md) {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
}

.copyright {
    font-size: 0.875rem;
    color: $gray-500;
}

.footer-legal {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-md;
}

.legal-link {
    font-size: 0.875rem;
    color: $gray-500;
    text-decoration: none;

    &:hover {
        color: #fff;
    }
}
</style>