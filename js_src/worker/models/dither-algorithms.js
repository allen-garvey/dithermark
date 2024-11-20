import {
    getBwAlgorithms,
    getColorAlgorithms,
} from '../../shared/models/dither-algorithms.js';

import { getBwDitherAlgorithmForItem } from './bw-algorithm-translation.js';
import { getColorDitherAlgorithmForItem } from './color-algorithm-translation.js';

export const getBwDitherAlgorithms = () =>
    getBwAlgorithms().map((item) => ({
        title: item.title,
        algorithm: getBwDitherAlgorithmForItem(item),
    }));

export const getColorDitherAlgorithms = () =>
    getColorAlgorithms().map((item) => ({
        title: item.title,
        algorithm: getColorDitherAlgorithmForItem(item),
    }));
