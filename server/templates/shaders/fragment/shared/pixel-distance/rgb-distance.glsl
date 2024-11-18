float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 distances = pixel1 - pixel2;
    return dot(vec3(1.0), distances * distances);
}