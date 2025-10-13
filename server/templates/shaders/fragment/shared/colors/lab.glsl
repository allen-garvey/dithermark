float rgbValueToLinear(float c) {
    return c >= 0.04045 ? pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
}

vec3 rgbToLinear(vec3 rgb) {
    return vec3(rgbValueToLinear(rgb.r), rgbValueToLinear(rgb.g), rgbValueToLinear(rgb.b));
}

vec3 rgbToOklab(vec3 rgb) {
    vec3 linear = rgbToLinear(rgb);

    float l = pow(0.4122214708 * linear.r + 0.5363325363 * linear.g + 0.0514459929 * linear.b, 1.0/3.0);
    float m = pow(0.2119034982 * linear.r + 0.6806995451 * linear.g + 0.1073969566 * linear.b, 1.0/3.0);
    float s = pow(0.0883024619 * linear.r + 0.2817188376 * linear.g + 0.6299787005 * linear.b, 1.0/3.0);

    return vec3(
        l * 0.2104542553 + m * 0.793617785 + s * -0.0040720468,
        l * 1.9779984951 + m * -2.428592205 + s * 0.4505937099,
        l * 0.0259040371 + m * 0.7827717662 + s * -0.808675766
    );
}

vec3 rgbToCieLab(vec3 rgb) {
    vec3 linear = rgbToLinear(rgb);

    float x = (linear.r * 0.4124 + linear.g * 0.3576 + linear.b * 0.1805) / 0.95047;
    float y = linear.r * 0.2126 + linear.g * 0.7152 + linear.b * 0.0722;
    float z = (linear.r * 0.0193 + linear.g * 0.1192 + linear.b * 0.9505) / 1.08883;

    x = x > 0.008856 ? pow(x, 1.0/3.0) : 7.787 * x + 16.0 / 116.0;
    y = y > 0.008856 ? pow(y, 1.0/3.0) : 7.787 * y + 16.0 / 116.0;
    z = z > 0.008856 ? pow(z, 1.0/3.0) : 7.787 * z + 16.0 / 116.0;

    return vec3(116.0 * y - 16.0, 500.0 * (x - y), 200.0 * (y - z));
}