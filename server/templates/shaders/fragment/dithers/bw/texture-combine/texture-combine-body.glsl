// used to combine 3 textures into a single output

vec4 pixel2 = texture2D(u_texture_2, v_texcoord);
vec4 pixel3 = texture2D(u_texture_3, v_texcoord);

vec3 majorityPixel;
if(pixel == pixel2 || pixel == pixel3){
    majorityPixel = pixel.rgb;
}
else{
    majorityPixel = pixel2.rbg;
}

bool shouldUseBlackPixel = majorityPixel == u_black_pixel;