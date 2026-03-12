import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const HAS_SEEN_SPLASH = 'bankapp_splash_seen';

// 1. Check if the user has already seen the splash in this session
const seen = sessionStorage.getItem(HAS_SEEN_SPLASH);

if (seen) {
  // If seen, bootstrap immediately (0.2s or less)
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
} else {
  // If NOT seen, show the "Branded Launch" for 2 seconds
  setTimeout(() => {
    bootstrapApplication(App, appConfig)
      .then(() => {
        // Set the flag so it doesn't show again on refresh
        sessionStorage.setItem(HAS_SEEN_SPLASH, 'true');
      })
      .catch((err) => console.error(err));
  }, 2000);
}