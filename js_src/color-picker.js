//color picker helper functionality
App.ColorPicker = (function(Pixel){
    //takes hex in form #ffffff and returns pixel
    function pixelFromColorPicker(hex){
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        return Pixel.create(r, g, b);
    }
    
    return {
        pixelFromHex: pixelFromColorPicker,
        COLOR_REPLACE_DEFAULT_BLACK_VALUE: '#000000',
        COLOR_REPLACE_DEFAULT_WHITE_VALUE: '#ffffff',
    };
    
})(App.Pixel);