float rgbValueToLinear(float c) {
    return c >= 0.04045 ? pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
}

vec3 rgbToLinear(vec3 rgb) {
    return vec3(rgbValueToLinear(rgb.r), rgbValueToLinear(rgb.g), rgbValueToLinear(rgb.b));
}

vec3 rgbToOklab(vec3 rgb) {
    vec3 linear = rgbToLinear(rgb);

    vec3 lms = vec3(
        pow(dot(vec3(0.4122214708, 0.5363325363, 0.0514459929), linear), 1.0/3.0),
        pow(dot(vec3(0.2119034982, 0.6806995451, 0.1073969566), linear), 1.0/3.0),
        pow(dot(vec3(0.0883024619, 0.2817188376, 0.6299787005), linear), 1.0/3.0)
    );

    return vec3(
        dot(vec3(0.2104542553, 0.793617785, -0.0040720468), lms),
        dot(vec3(1.9779984951, -2.428592205, 0.4505937099), lms),
        dot(vec3(0.0259040371, 0.7827717662, -0.808675766), lms)
    );
}

vec3 rgbToCieLab(vec3 rgb) {
    vec3 linear = rgbToLinear(rgb);

    float x = dot(vec3(0.4124, 0.3576, 0.1805), linear) / 0.95047;
    float y = dot(vec3(0.2126, 0.7152 ,0.0722), linear);
    float z = dot(vec3(0.0193, 0.1192, 0.9505), linear) / 1.08883;

    x = x > 0.008856 ? pow(x, 1.0/3.0) : 7.787 * x + 16.0 / 116.0;
    y = y > 0.008856 ? pow(y, 1.0/3.0) : 7.787 * y + 16.0 / 116.0;
    z = z > 0.008856 ? pow(z, 1.0/3.0) : 7.787 * z + 16.0 / 116.0;

    return vec3(116.0 * y - 16.0, 500.0 * (x - y), 200.0 * (y - z));
}