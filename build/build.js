import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

import { renderHome } from '../server/templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

renderHome().then((indexContent) =>
    fs.writeFile(
        path.join(__dirname, '..', 'public_html', 'index.html'),
        indexContent
    )
);
