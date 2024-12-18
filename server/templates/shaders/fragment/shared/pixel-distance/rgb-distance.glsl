// a quicker version of built-in distance() function or pythagorean distance, since we don't need the square root since we are only using it for comparisons
float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 distances = pixel1 - pixel2;
    return dot(vec3(1.0), distances * distances);
}