// don't use bayerValue variable, since we need it before 0.5 is subtracted, and without the possible randomization
outputPixel = hue_lightness_dither(outputPixel, bayerPixel.r);