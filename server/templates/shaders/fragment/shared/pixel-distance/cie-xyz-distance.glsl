float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 linear1 = rgbToLinear(pixel1);
    vec3 linear2 = rgbToLinear(pixel2);
    vec3 distances = linear1 - linear2;
    return dot(vec3(1.0), distances * distances);
}