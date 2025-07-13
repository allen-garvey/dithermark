// looks to see if current pixel is darker than surrounding pixels
// end result is similar to edge detection

float sum = 0.0;
vec2 dx = vec2(1.0 / u_image_dimensions.x, 0.0);
vec2 dy = vec2(0.0, 1.0 / u_image_dimensions.y);
float total = 0.0;

for (float x = -4.0; x <= 4.0; x += 1.0) {
    for (float y = -4.0; y <= 4.0; y += 1.0) {
        vec3 sample = texture(u_texture, v_texcoord + dx * x + dy * y).rgb;
        sum += lightness(sample);
        total++;
    }
}
float average = sum / total;
float adjustment = u_threshold + ((1.0 - u_threshold) / 4.0);

bool shouldUseBlackPixel = pixelLightness < adjustment * average;