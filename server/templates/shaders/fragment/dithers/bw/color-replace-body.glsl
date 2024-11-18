// pixel can be 1.0 for white or 0.0 for black
// we are comparing to 0.0, but can't use == because of floating point precision
bool shouldUseBlackPixel = pixel.r < 0.5;