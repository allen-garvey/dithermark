export {
    UNSPLASH_APP_NAME,
    UNSPLASH_DOWNLOAD_URL,
    UNSPLASH_ACCESS_KEY,
} from './unsplash-secrets.js';

export const APP_NAME = 'Dithermark';
export const COLOR_DITHER_MAX_COLORS = 18;
//this is used for yliluoma 1 dither for largest dimensions used
//dimensions are 8 instead of 16, since at dimensions 16 it is very slow, while not being much different than 8
export const YLILUOMA_1_ORDERED_MATRIX_MAX_LENGTH = 8 * 8;

// unsplash
export const UNSPLASH_API_PHOTO_ID_QUERY_KEY = 'photo_id';
