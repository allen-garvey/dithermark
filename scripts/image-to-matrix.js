import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

import { lightness } from '../js/shared/pixel-math-lite.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outputDir = path.join(__dirname, 'matrix-output');

const imageName = 'HDR_L_6.png';

fs.mkdir(outputDir, { recursive: true })
    .then(() =>
        sharp(path.join(__dirname, 'images', imageName))
            .removeAlpha()
            .raw()
            .toBuffer()
    )
    .then(pixels => {
        const pixelsLength = pixels.length;
        const lightnessMatrix = new Uint8Array(pixelsLength / 3);
        const lightnessDivisor = 256 / lightnessMatrix.length;

        for (let i = 0, j = 0; i < pixelsLength; i += 3, j++) {
            lightnessMatrix[j] = Math.floor(
                lightness(pixels.subarray(i, i + 3)) / lightnessDivisor
            );
        }

        const sum = lightnessMatrix.reduce((acc, value) => acc + value, 0);

        const outputFilepath = path.join(outputDir, `${imageName}.matrix.json`);
        console.log(
            `${imageName} saved to: ${outputFilepath}\nAverage lightness: ${
                sum / lightnessMatrix.length
            }. Ideal average: ${lightnessMatrix.length / 2}`
        );

        return fs.writeFile(
            outputFilepath,
            JSON.stringify(Array.from(lightnessMatrix))
        );
    });
