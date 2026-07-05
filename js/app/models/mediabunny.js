// title: user displayed title
// key: unique key saved in user settings
// mediabunny: codec key from https://mediabunny.dev/guide/supported-formats-and-codecs
const mediabunnyCodecs = [
    {
        title: 'H.264',
        key: 'H.264',
        mediabunny: 'avc',
    },
    {
        title: 'H.265',
        key: 'H.265',
        mediabunny: 'hevc',
    },
    {
        title: 'VP9',
        key: 'VP9',
        mediabunny: 'vp9',
    },
    {
        title: 'VP8',
        key: 'VP8',
        mediabunny: 'vp8',
    },
    {
        title: 'AV1',
        key: 'AV1',
        mediabunny: 'av1',
    },
];

export const getSupportedVideoCodecs = mediabunny => {
    return mediabunny.getEncodableVideoCodecs().then(codecs => {
        const codecSet = new Set(codecs);
        return mediabunnyCodecs.filter(codec => codecSet.has(codec.mediabunny));
    });
};
