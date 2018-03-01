App.Pixel = (function(){
    const R_INDEX = 0;
    const G_INDEX = 1;
    const B_INDEX = 2;
    const A_INDEX = 3;
    
    function createPixel(r, g, b, a = 255){
        let pixel = new Uint8ClampedArray(4);
        pixel[R_INDEX] = r;
        pixel[G_INDEX] = g;
        pixel[B_INDEX] = b;
        pixel[A_INDEX] = a;
        
        return pixel;
    }
    
    return {
       create: createPixel,
       R_INDEX: R_INDEX,
       G_INDEX: G_INDEX,
       B_INDEX: B_INDEX,
       A_INDEX: A_INDEX,
    };
})();