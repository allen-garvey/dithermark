float quick_distance(vec3 pixel1, vec3 pixel2){
    vec2 distances = pixel1.rg - pixel2.rg;
    return dot(vec2(1.0), distances * distances);
}