export default {
    SharedArrayBuffer: typeof SharedArrayBuffer === 'undefined' ? ArrayBuffer : SharedArrayBuffer,
};
