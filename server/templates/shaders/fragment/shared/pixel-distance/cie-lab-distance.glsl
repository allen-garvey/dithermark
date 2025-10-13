float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 lab1 = rgbToCieLab(pixel1);
    vec3 lab2 = rgbToCieLab(pixel2);
    vec3 distances = lab1 - lab2;
    return dot(vec3(1.0), distances * distances);
}