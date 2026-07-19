float r2SequenceValue = u_dither_r_coefficient * (r2_sequence(gl_FragCoord.xy) - 0.5);
adjustedPixel = clamp(adjustedPixel + vec3(r2SequenceValue), 0.0, 1.0);