import Image from '../image.js';
import { A_INDEX } from '../../shared/pixel.js';
import PixelMath from '../../shared/pixel-math.js';

const WINDOW_SIZE = 8;

const adaptiveThreshold = (pixels, imageWidth, imageHeight, threshold, blackPixel, whitePixel) => {
    let percentAdjustment = threshold / 255;
    percentAdjustment = percentAdjustment + ((1 - percentAdjustment) / 4);

    return Image.transform(pixels, imageWidth, imageHeight, (pixel, x, y) => {
        const xStart = Math.max(0, x - WINDOW_SIZE);
        const xEnd = Math.min(imageWidth, x + WINDOW_SIZE);
        const yStart = Math.max(0, y - WINDOW_SIZE);
        const yEnd = Math.min(imageHeight, y + WINDOW_SIZE);

        let sum = 0;
        for (let x = xStart; x < xEnd; x++) {
            for (let y = yStart; y < yEnd; y++) {
                const pixelIndex = y * imageWidth * 4 + x * 4;
                const pixel = pixels.subarray(pixelIndex, pixelIndex + 4);
                sum += PixelMath.lightness(pixel);
            }
        }
        const windowDimensions = (xEnd - xStart) * (yEnd - yStart);
        const averageLightness = sum / windowDimensions;

        const lightness = PixelMath.lightness(pixel);


        if (lightness >= averageLightness * percentAdjustment) {
            whitePixel[A_INDEX] = pixel[A_INDEX];
            return whitePixel;
        }
        blackPixel[A_INDEX] = pixel[A_INDEX];
        return blackPixel;

    });
};

export default {
    image: adaptiveThreshold,
};