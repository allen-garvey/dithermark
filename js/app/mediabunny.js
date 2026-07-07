// wrapper for mediabunny both so auto-complete works, and so we can tree shake
import {
    Input,
    BlobSource,
    ALL_FORMATS,
    QUALITY_VERY_HIGH,
    Output,
    Mp4OutputFormat,
    BufferTarget,
    Conversion,
    CanvasSource,
} from '../../node_modules/mediabunny/dist/bundles/mediabunny.mjs';

export { getEncodableVideoCodecs } from '../../node_modules/mediabunny/dist/bundles/mediabunny.mjs';

/**
 *
 * @param {File} videoFile
 * @param {string} codec
 * @param {number} outputFps
 * @param {Function} processCallback
 * @returns
 */
export const initConversion = (
    videoFile,
    codec,
    outputFps,
    processCallback
) => {
    const input = new Input({
        source: new BlobSource(videoFile),
        formats: ALL_FORMATS,
    });

    const output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
    });

    return [
        output,
        Conversion.init({
            input,
            output,
            video: {
                process: processCallback,
                codec,
                frameRate: outputFps,
                forceTranscode: true,
                bitrate: QUALITY_VERY_HIGH,
            },
        }),
    ];
};

/**
 *
 * @param {Function} finalizeCallback
 * @returns
 */
export const createOutput = finalizeCallback => {
    return new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
        onFinalize: finalizeCallback,
    });
};

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} codec
 * @param {number} outputFps
 * @returns
 */
export const createCanvasSource = (canvas, codec, outputFps) => {
    return new CanvasSource(canvas, {
        codec,
        bitrate: QUALITY_VERY_HIGH,
        sizeChangeBehavior: 'contain',
        transform: {
            frameRate: outputFps,
        },
    });
};
