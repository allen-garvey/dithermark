// ordered dither declaration gets concatenated here ?>
    
//based on: http://alex-charlton.com/posts/Dithering_on_the_GPU/
//Alex Charlton considers this algorithm released in the public domain

float lightnessStep(float l){
    float lightnessSteps = 4.0;
    //Quantize the lightness to one of `lightnessSteps` values
    return floor(0.5 + l * lightnessSteps) / lightnessSteps;
}

vec3 hue_lightness_dither(vec3 pixel, float bayerValue){
    vec3 hsl = rgb2hsl(pixel);

    float pixelLightness = hsl.b;
    float l1 = lightnessStep(max(pixelLightness - 0.125, 0.0));
    float l2 = lightnessStep(min(pixelLightness + 0.124, 1.0));
    float lightnessDiff = (pixelLightness - l1) / (l2 - l1);
    
    float adjustedLightness = lightnessDiff < bayerValue ? l1 : l2;
    
    return hsl2rgb(vec3(hsl.rg, adjustedLightness));
}