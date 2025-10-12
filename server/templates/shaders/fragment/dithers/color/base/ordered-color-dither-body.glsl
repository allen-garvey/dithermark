vec2 bayerPixelCoord = vec2(gl_FragCoord.xy / vec2(u_bayer_texture_dimensions));
vec4 bayerPixel = texture(u_bayer_texture, bayerPixelCoord);
float bayerValue = bayerPixel.r - 0.5;
#{{bayerValueAdjustment}}
adjustedPixel = clamp(adjustedPixel + vec3(u_dither_r_coefficient * bayerValue), 0.0, 1.0);