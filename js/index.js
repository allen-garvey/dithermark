import { createApp } from 'vue';
import App from './app/vues/app.vue';

const containerEl = document.getElementById('app');
const useFfmpegServer = containerEl.dataset.ffmpegServer === 'true';

const app = createApp(App, { useFfmpegServer });
app.mount(containerEl);
