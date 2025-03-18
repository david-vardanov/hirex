<template>
  <ion-app>
    <ion-router-outlet />
    <transition-overlay v-if="isTransitioning" />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TransitionOverlay from '@/components/common/TransitionOverlay.vue';
import { useAppStore } from '@/store/appStore';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
    TransitionOverlay
  },
  setup() {
    const router = useRouter();
    const appStore = useAppStore();
    const isTransitioning = ref<boolean>(false);

    // Handle global route transitions
    router.beforeEach((to, from, next) => {
      if (to.meta.requiresTransition && from.name) {
        isTransitioning.value = true;
        setTimeout(() => {
          isTransitioning.value = false;
          next();
        }, 500); // Adjust timing as needed
      } else {
        next();
      }
    });

    // Initialize app
    onMounted(() => {
      // Check for saved session with additional error handling
      try {
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
          appStore.restoreSession(savedToken)
            .catch((error: Error) => {
              console.error('[SessionRestore] Failed to restore session:', error);
              localStorage.removeItem('auth_token');
            });
        }
      } catch (error) {
        console.error('[AppInit] Critical initialization error:', error);
        // Fallback to safe state
        localStorage.removeItem('auth_token');
      }
    });

    return {
      isTransitioning
    };
  }
});
</script>

<style lang="scss">
// Global styles can go here</style>