// from: http://www.chilliant.com/rgb2hsv.html
// also relevant: https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
// and http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl

vec3 RGBtoHCV(vec3 rgb){
    float epsilon = 1.0e-10;
    // Based on work by Sam Hocevar and Emil Persson
    vec4 P = (rgb.g < rgb.b) ? vec4(rgb.bg, -1.0, 2.0/3.0) : vec4(rgb.gb, 0.0, -1.0/3.0);
    vec4 Q = (rgb.r < P.x) ? vec4(P.xyw, rgb.r) : vec4(rgb.r, P.yzx);
    float C = Q.x - min(Q.w, Q.y);
    float H = abs((Q.w - Q.y) / (6.0 * C + epsilon) + Q.z);
    return vec3(H, C, Q.x);
}

vec3 HUEtoRGB(float hue){
    float r = abs(hue * 6.0 - 3.0) - 1.0;
    float g = 2.0 - abs(hue * 6.0 - 2.0);
    float b = 2.0 - abs(hue * 6.0 - 4.0);
    //saturate function is the same as clamping between 0.0, and 1.0
    return clamp(vec3(r, g, b), 0.0, 1.0);
}

//from: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion as using branchless version gives incorrect saturation results
float pixelSaturation(vec3 pixel){
    float maxValue = max(max(pixel.r, pixel.g), pixel.b);
    float minValue = min(min(pixel.r, pixel.g), pixel.b);
    if(maxValue == minValue){
        return 0.0;
    }
    float c = (maxValue + minValue) / 2.0;
    float diff = maxValue - minValue;
    return c > 0.5 ? diff / (2.0 - diff) : diff / (maxValue + minValue);
}

vec3 rgb2hsl(vec3 pixel){
    vec3 hcv = RGBtoHCV(pixel);
    float l = hcv.z - hcv.y * 0.5;
    return vec3(hcv.x, pixelSaturation(pixel), l);
}

vec3 hsl2rgb(vec3 pixel){
    vec3 rgb = HUEtoRGB(pixel.x);
    float c = (1.0 - abs(2.0 * pixel.z - 1.0)) * pixel.y;
    return (rgb - 0.5) * c + pixel.z;
}

float hue_distance(float hue1, float hue2){
    float distance = abs(hue1 - hue2);
    //since hue is circular, we need to compare it with the inversion
    return min(distance, 1.0 - distance);
}

float hue(vec3 pixel){
    return rgb2hsl(pixel).r;
}

float pixel_luma(vec3 pixel){
    return dot(vec3(0.299, 0.587, 0.114), pixel);
}