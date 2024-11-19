import {
    getBwAlgorithms,
    getBwDitherModel,
    getColorAlgorithms,
    getColorDitherModel,
} from '../../shared/models/dither-algorithms';

const bwIndexMap = new Map(
    getBwAlgorithms().map((item, index) => [item.slug, index])
);

const colorIndexMap = new Map(
    getColorAlgorithms().map((item, index) => [item.slug, index])
);

const addIndexToGroupItems = (group, indexMap) =>
    group.map((group) => ({
        ...group,
        item: group.items.map((item) => ({
            ...item,
            index: indexMap.get(item.slug),
        })),
    }));

export const getBwGroups = () =>
    addIndexToGroupItems(getBwDitherModel(), bwIndexMap);

export const getColorGroups = () =>
    addIndexToGroupItems(getColorDitherModel(), colorIndexMap);
