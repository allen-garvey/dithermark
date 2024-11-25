float simplexValue = u_dither_r_coefficient * (snoise(gl_FragCoord.xy) - 0.5);
adjustedPixel = clamp(adjustedPixel + vec3(simplexValue), 0.0, 1.0);