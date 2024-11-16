import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { APP_NAME } from '../constants.js';
import { renderHome } from './templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(
    express.static(path.join(__dirname, '..', 'public_html'), { index: false })
);

app.get('/', (req, res) => {
    renderHome().then((html) => res.send(html));
});

app.listen(port, () => {
    console.log(
        `${APP_NAME} development server listening on http://localhost:${port}`
    );
});
