// wrapper for mediabunny both so auto-complete works, and so we can tree shake
import {
    Input,
    BlobSource,
    ALL_FORMATS,
    QUALITY_VERY_HIGH,
    QUALITY_HIGH,
    Output,
    Mp4OutputFormat,
    BufferTarget,
    Conversion,
    CanvasSource,
} from '../../node_modules/mediabunny/dist/bundles/mediabunny.mjs';

export { getEncodableVideoCodecs } from '../../node_modules/mediabunny/dist/bundles/mediabunny.mjs';

/**
 *
 * @param {string} videoQuality
 * @returns
 */
const getBitrate = videoQuality => {
    switch (videoQuality) {
        case 'very_low':
            return QUALITY_HIGH;
        default:
            return QUALITY_VERY_HIGH;
    }
};

/**
 *
 * @param {string} videoQuality
 * @param {number|undefined} outputFps
 * @returns {number}
 */
const getKeyFrameInterval = (videoQuality, outputFps = 240) => {
    switch (videoQuality) {
        case 'ultra':
            return 1 / outputFps;
        case 'very_high':
            return Math.min((1 / outputFps) * 2, 1);
        case 'high':
            return Math.min((1 / outputFps) * 4, 1);
        case 'medium':
            return Math.min((1 / outputFps) * 8, 1);
        case 'low':
            return 1;
        default:
            return 2;
    }
};

/**
 *
 * @param {File} videoFile
 * @param {string} codec
 * @param {number} outputFps
 * @param {string} videoQuality
 * @param {Function} processCallback
 * @returns
 */
export const initConversion = (
    videoFile,
    codec,
    outputFps,
    videoQuality,
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
                bitrate: getBitrate(videoQuality),
                keyFrameInterval: getKeyFrameInterval(videoQuality, outputFps),
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
 * @param {string} videoQuality
 * @returns
 */
export const createCanvasSource = (canvas, codec, outputFps, videoQuality) => {
    return new CanvasSource(canvas, {
        codec,
        bitrate: getBitrate(videoQuality),
        keyFrameInterval: getKeyFrameInterval(videoQuality, outputFps),
        sizeChangeBehavior: 'contain',
        transform: {
            frameRate: outputFps,
        },
    });
};
