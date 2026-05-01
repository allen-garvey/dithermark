float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 distances = pixel1 - pixel2;
    return dot(vec3(0.587, 0.299, 0.114), distances * distances);
}