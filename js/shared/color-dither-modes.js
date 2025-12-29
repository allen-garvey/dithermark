const exports = new Map();

exports.set('HUE', { id: 4, title: 'Hue' });
exports.set('LIGHTNESS', { id: 3, title: 'Lightness' });
exports.set('HUE_LIGHTNESS', { id: 2, title: 'Hue & Lightness' });
exports.set('HSL_WEIGHTED', { id: 1, title: 'Weighted HSL' });
exports.set('RGB', { id: 0, title: 'RGB' });
exports.set('LUMA', { id: 5, title: 'Luma' });
exports.set('OKLAB', { id: 6, title: 'Oklab' });
exports.set('OKLAB_TAXI', { id: 7, title: 'Oklab (taxi)' });
exports.set('CIE_XYZ', { id: 8, title: 'CIE XYZ' });
exports.set('CIE_LAB', { id: 9, title: 'CIE Lab' });
exports.set('CIE_LAB_TAXI', { id: 10, title: 'CIE Lab (taxi)' });

export default exports;
