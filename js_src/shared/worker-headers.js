App.WorkerHeaders = {
    LOAD_IMAGE: 0, //for sending image to workers to load, the only header which does not get sent back from workers 
    DITHER: 1, //somewhat confusingly, this is for dithering in black and white
    DITHER_BW: 2, //for dithering in black and white, where black and white replacement values are not set
    HISTOGRAM: 3, //bw dither lightness histogram
    HUE_HISTOGRAM: 4, //color dither hue histogram
    DITHER_COLOR: 5, //dithering in color
    OPTIMIZE_PALETTE: 6, //color dither optimize palette
};