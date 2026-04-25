float quick_distance(vec3 pixel1, vec3 pixel2){
    vec2 distances = pixel1.gb - pixel2.gb;
    return dot(vec2(1.0), distances * distances);
}