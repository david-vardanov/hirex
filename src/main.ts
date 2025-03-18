import { createApp } from "vue";
import { IonicVue } from "@ionic/vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

// Import base Ionic styles
import "@ionic/vue/css/core.css";
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

// Import custom styles
import "./assets/scss/main.scss";

// Error interface for global error handling
interface ErrorWithInfo {
  message: string;
  stack?: string;
  componentName?: string;
  lifecycleHook?: string;
}

// Initialize app
const app = createApp(App).use(IonicVue).use(createPinia()).use(router);

// Global error handler with structured logging
app.config.errorHandler = (err: unknown, vm: any, info: string): void => {
  const error = err as Error;
  const formattedError: ErrorWithInfo = {
    message: error.message || "Unknown error",
    stack: error.stack,
    componentName: vm?.$options?.name || "UnknownComponent",
    lifecycleHook: info,
  };

  console.error("[GlobalErrorHandler]", formattedError);

  // Here you would integrate with an error logging service
  // logErrorToService(formattedError);
};

// Wait for the Ionic platform to be ready
router.isReady().then(() => {
  app.mount("#app");
});
