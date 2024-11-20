import {
    getBwAlgorithms,
    getBwDitherModel,
    getColorAlgorithms,
    getColorDitherModel,
} from '../../shared/models/dither-algorithms.js';

import { getBwWebglTranslator } from './bw-algorithm-webgl-translation.js';
import { getColorWebglTranslator } from './color-algorithm-webgl-translation.js';

const bwIndexMap = new Map(
    getBwAlgorithms().map((item, index) => [item.slug, index])
);

const colorIndexMap = new Map(
    getColorAlgorithms().map((item, index) => [item.slug, index])
);

const addIndexToGroupItems = (group, indexMap) =>
    group.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
            ...item,
            index: indexMap.get(item.slug),
        })),
    }));

export const getBwGroups = () =>
    addIndexToGroupItems(getBwDitherModel(), bwIndexMap);

export const getColorGroups = () =>
    addIndexToGroupItems(getColorDitherModel(), colorIndexMap);

/**
 * @param {boolean} isWebglHighIntPrecisionSupported
 */
export const getBwDitherAlgorithms = (isWebglHighIntPrecisionSupported) => {
    const webglTranslator = getBwWebglTranslator(
        isWebglHighIntPrecisionSupported
    );

    return getBwAlgorithms().map((item, index) => ({
        ...item,
        index,
        webGlFunc: webglTranslator(item),
    }));
};

/**
 * @param {boolean} isWebglHighIntPrecisionSupported
 */
export const getColorDitherAlgorithms = (isWebglHighIntPrecisionSupported) => {
    const webglTranslator = getColorWebglTranslator(
        isWebglHighIntPrecisionSupported
    );

    return getColorAlgorithms().map((item, index) => ({
        ...item,
        index,
        webGlFunc: webglTranslator(item),
    }));
};
