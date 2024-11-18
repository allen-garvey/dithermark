float randomValue = u_dither_r_coefficient * (rand(v_texcoord.xy*u_random_seed.xy) - 0.5);
adjustedPixel = clamp(adjustedPixel + vec3(randomValue), 0.0, 1.0);