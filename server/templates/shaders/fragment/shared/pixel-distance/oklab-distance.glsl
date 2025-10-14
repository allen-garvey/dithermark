float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 lab1 = rgbToOklab(pixel1);
    vec3 lab2 = rgbToOklab(pixel2);
    vec3 distances = lab1 - lab2;
    return dot(vec3(1.0), distances * distances);
}