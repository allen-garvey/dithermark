vec2 bayerPixelCoord = vec2(gl_FragCoord.xy / vec2(u_bayer_texture_dimensions));
vec4 bayerPixel = texture2D(u_bayer_texture, bayerPixelCoord);
float bayerValue = bayerPixel.r - 0.5;
#{{bayerValueAdjustment}}
bool shouldUseBlackPixel = pixelLightness + u_dither_r_coefficient * bayerValue < u_threshold;