// based on [taxicab difference](https://en.wikipedia.org/wiki/Taxicab_geometry)
// as described here https://en.wikipedia.org/wiki/Color_difference#Other_geometric_constructions
float quick_distance(vec3 pixel1, vec3 pixel2){
    vec3 lab1 = rgbToCieLab(pixel1);
    vec3 lab2 = rgbToCieLab(pixel2);
    return distance(lab1.yz, lab2.yz) + abs(lab1.x - lab2.x);
}