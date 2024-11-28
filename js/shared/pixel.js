export const R_INDEX = 0;
export const G_INDEX = 1;
export const B_INDEX = 2;
export const A_INDEX = 3;

export const createPixel = (r, g, b, a = 255) => {
    const pixel = new Uint8ClampedArray(4);
    pixel[R_INDEX] = r;
    pixel[G_INDEX] = g;
    pixel[B_INDEX] = b;
    pixel[A_INDEX] = a;

    return pixel;
}

