import path from 'path';

const mimeTypes = new Map([
    ['.js', 'text/javascript; charset=UTF-8'],
    ['.css', 'text/css; charset=UTF-8'],
]);

/**
 *
 * @param {import('express').Response} res
 * @param {import('memfs/lib/node/types').FsPromisesApi} fs
 * @param {string} rootDir
 * @param {string} filename
 * @returns {Promise}
 */
export const serveFile = (res, fs, rootDir, filename) => {
    const mimeType = mimeTypes.get(path.extname(filename));

    return fs
        .readFile(path.resolve(rootDir, filename))
        .catch(error => {
            if (error.code === 'ENOENT') {
                res.sendStatus(404);
            } else {
                console.error(error);
            }
            throw error;
        })
        .then(
            data => {
                if (data === null) {
                    return;
                }
                res.setHeader('Cache-Control', 'no-store');
                res.setHeader('Content-Type', mimeType);
                res.send(data);
            },
            () => {}
        );
};
