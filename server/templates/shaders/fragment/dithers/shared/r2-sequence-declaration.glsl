// based upon r2 sequence from: https://matejlou.blog/2023/12/06/ordered-dithering-for-arbitrary-or-irregular-palettes/
// and https://web.archive.org/web/20260202183215/https://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/

// flip y direction so output matches webworker version
// note that mod() uses floor instead of trunc
// however when a custom mod function using trunc was used, it caused the image to be cut off
float r2_sequence(vec2 v){
    float value = mod(0.7548776662 * v.x + 0.56984029 * v.y * -1.0, 1.0);
    return value < 0.5 ? 2.0 * value : 2.0 - 2.0 * value;
}