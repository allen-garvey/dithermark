float aDitherValue = u_dither_r_coefficient * (arithmeticDither(gl_FragCoord.xy, pixel.rgb) - 0.5);
adjustedPixel = clamp(adjustedPixel + vec3(aDitherValue), 0.0, 1.0);