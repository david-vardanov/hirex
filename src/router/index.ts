import { createRouter, createWebHistory } from "@ionic/vue-router";
import {
  RouteRecordRaw,
  RouteLocationNormalized,
  NavigationGuardNext,
} from "vue-router";

// Route components
// We use lazy loading for better performance and code splitting
const LandingPage = () => import("@/views/LandingPage.vue");
const RegistrationPage = () => import("@/views/RegistrationPage.vue");
const LoginPage = () => import("@/views/LoginPage.vue");
const DashboardPage = () => import("@/views/DashboardPage.vue");
const ProfilePage = () => import("@/views/ProfilePage.vue");
const NotFoundPage = () => import("@/views/NotFoundPage.vue");

// Types for route meta
declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresTransition?: boolean;
    title?: string;
  }
}

// Auth guard helper
const requiresAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  try {
    const isAuthenticated = localStorage.getItem("auth_token") !== null;
    if (isAuthenticated) {
      next();
    } else {
      next({
        name: "Login",
        query: { redirect: to.fullPath },
        params: { authRequired: true },
      });
    }
  } catch (error) {
    console.error("[AuthGuard] Authentication check failed:", error);
    // Fail safe to login page on error
    next({ name: "Login" });
  }
};

// Routes configuration
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Landing",
    component: LandingPage,
    meta: {
      requiresTransition: true,
      title: "Welcome",
    },
  },
  {
    path: "/register",
    name: "Registration",
    component: RegistrationPage,
    meta: {
      requiresTransition: true,
      title: "Create Your Profile",
    },
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: {
      requiresTransition: true,
      title: "Sign In",
    },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardPage,
    meta: {
      requiresAuth: true,
      requiresTransition: true,
      title: "Your Dashboard",
    },
    beforeEnter: requiresAuth,
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfilePage,
    meta: {
      requiresAuth: true,
      requiresTransition: true,
      title: "Your Profile",
    },
    beforeEnter: requiresAuth,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundPage,
    meta: {
      title: "Page Not Found",
    },
  },
];

// Router instance
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth" as ScrollBehavior,
      };
    } else {
      return { top: 0 };
    }
  },
});

// Update document title based on route meta
router.afterEach((to) => {
  try {
    document.title = to.meta.title
      ? `${to.meta.title} | Candidate Platform`
      : "Candidate Platform";
  } catch (error) {
    console.error("[Router] Failed to update document title:", error);
  }
});

export default router;
