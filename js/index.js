import { createApp } from 'vue';
import App from './app/vues/app.vue';

const containerEl = document.getElementById('app');
const isDev = containerEl.dataset.isDev === 'true';

const app = createApp(App, { isDev });
app.mount(containerEl);
