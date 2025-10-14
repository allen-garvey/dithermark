//rgb with correction for luma based on: http://www.tannerhelland.com/3643/grayscale-image-algorithm-vb6/
float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 distances = pixel1 - pixel2;
    return pixel_luma(distances * distances);
}

vec3 transform_pixel(vec3 pixel) {
    return pixel;
}

float quick_distance1(vec3 pixel1, vec3 pixel2){
    vec3 distances = pixel1 - pixel2;
    return pixel_luma(distances * distances);
}