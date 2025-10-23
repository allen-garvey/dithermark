/**
 * Used for performance timing
 * if changing public functions, make sure to update timer-dummy.js for release builds
 */

let webglTimeout = null;

/**
 *
 * @param {string} name
 * @param {number} numPixels
 * @param {Function} functionToTime
 * @param {WebGL2RenderingContext|undefined} gl
 */
function megapixelsPerSecond(name, numPixels, functionToTime, gl) {
    clearTimeout(webglTimeout);
    const megapixels = numPixels / 1000000;
    const start = performance.now();
    const webglExtension = gl?.getExtension('EXT_disjoint_timer_query_webgl2');
    let webglQuery;

    if (webglExtension) {
        webglQuery = gl.createQuery();
        gl.beginQuery(webglExtension.TIME_ELAPSED_EXT, webglQuery);
    }
    functionToTime();
    const end = performance.now();
    if (webglExtension) {
        gl.endQuery(webglExtension.TIME_ELAPSED_EXT);

        webglTimeout = setTimeout(() => {
            const available = gl.getQueryParameter(
                webglQuery,
                gl.QUERY_RESULT_AVAILABLE
            );
            const disjoint = gl.getParameter(webglExtension.GPU_DISJOINT_EXT);

            if (available && !disjoint) {
                const timeElapsed =
                    gl.getQueryParameter(webglQuery, gl.QUERY_RESULT) /
                    1_000_000_000;
                console.log(
                    `WebGL2 time for ${name}: ${timeElapsed}s ${(
                        megapixels / timeElapsed
                    ).toFixed(2)} megapixels/s`
                );
            }
        }, 3000);
    }
    const seconds = (end - start) / 1000;
    const megapixelsPerSecond = megapixels / seconds;
    console.log(
        `${name}: ${seconds}s, ${megapixelsPerSecond.toFixed(2)} megapixels/s`
    );
}

export default {
    megapixelsPerSecond,
};
