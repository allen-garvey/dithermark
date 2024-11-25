import {
    colorQuantizationModesModel,
    getColorQuantizationModes,
} from '../../shared/models/color-quantization-modes.js';

const slugToIndexMap = new Map(
    getColorQuantizationModes().map((item, index) => [item.slug, index])
);

export const getColorQuantizationGroups = () =>
    colorQuantizationModesModel.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
            ...item,
            index: slugToIndexMap.get(item.slug),
        })),
    }));
