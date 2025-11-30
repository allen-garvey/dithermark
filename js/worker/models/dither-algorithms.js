import {
    getBwAlgorithms,
    getColorAlgorithms,
} from '../../shared/models/dither-algorithms.js';

import { getBwDitherAlgorithmForItem } from './bw-algorithm-translation.js';
import { getColorDitherAlgorithmForItem } from './color-algorithm-translation.js';

export const getBwDitherAlgorithms = () =>
    getBwAlgorithms().map(item => ({
        title: item.title,
        algorithm: getBwDitherAlgorithmForItem(item),
    }));

export const getColorDitherAlgorithms = () =>
    getColorAlgorithms().map(item => {
        const algorithmCache = new Map();

        return {
            title: item.title,
            getAlgorithm: colorComparisonId => {
                if (algorithmCache.has(colorComparisonId)) {
                    return algorithmCache.get(colorComparisonId);
                }
                const algorithm = getColorDitherAlgorithmForItem(item);
                algorithmCache.set(colorComparisonId, algorithm);

                return algorithm;
            },
        };
    });
