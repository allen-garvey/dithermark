import { BATCH_CONVERT_STATE } from './batch-convert-states.js';

export const BATCH_IMAGE_MODE_EXPORT_IMAGES = 1;
export const BATCH_IMAGE_MODE_EXPORT_VIDEO = 2;
export const BATCH_IMAGE_MODE_VIDEO_TO_VIDEO = 3;

export const stagesMap = new Map([
    [
        BATCH_IMAGE_MODE_EXPORT_IMAGES,
        new Map([[BATCH_CONVERT_STATE.PROCESSING_FRAMES, 1]]),
    ],
    [
        BATCH_IMAGE_MODE_EXPORT_VIDEO,
        new Map([
            [BATCH_CONVERT_STATE.PROCESSING_FRAMES, 1],
            [BATCH_CONVERT_STATE.FRAMES_TO_VIDEO, 2],
        ]),
    ],
    [
        BATCH_IMAGE_MODE_VIDEO_TO_VIDEO,
        new Map([
            [BATCH_CONVERT_STATE.VIDEO_TO_FRAMES, 1],
            [BATCH_CONVERT_STATE.PROCESSING_FRAMES, 2],
            [BATCH_CONVERT_STATE.FRAMES_TO_VIDEO, 3],
        ]),
    ],
]);
