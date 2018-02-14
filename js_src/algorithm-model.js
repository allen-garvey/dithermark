App.AlgorithmModel = (function(WebGlBwDither, WebGlColorDither){
    var ditherAlgorithms = [
                {
                    title: "Threshold", 
                    id: 1,
                    webGlFunc: WebGlBwDither.threshold,
                },
                {
                    title: "Random Threshold", 
                    id: 2,
                    webGlFunc: WebGlBwDither.randomThreshold,
                },
                {
                    title: "Atkinson", 
                    id: 3,
                },
                {
                    title: "Floyd-Steinberg", 
                    id: 4,
                },
                {
            		title: "Javis-Judice-Ninke",
            		id: 5,
            	},
            	{
            		title: "Stucki",
            		id: 6,
            	},
            	{
            		title: "Burkes",
            		id: 7,
            	},
            	{
            		title: "Sierra3",
            		id: 8,
            	},
            	{
            		title: "Sierra2",
            		id: 9,
            	},
            	{
            		title: "Sierra1",
            		id: 10,
            	},
            	{
            	    title: "Garvey",
            	    id: 15,
            	},
            	{
            	    title: "Ordered Dither 2x2",
            	    id: 11,
            	    webGlFunc: WebGlBwDither.creatOrderedDither(2),
            	},
            	{
            	    title: "Ordered Dither 4x4",
            	    id: 12,
            	    webGlFunc: WebGlBwDither.creatOrderedDither(4),
            	},
            	{
            	    title: "Ordered Dither 8x8",
            	    id: 13,
            	    webGlFunc: WebGlBwDither.creatOrderedDither(8),
            	},
            	{
            	    title: "Ordered Dither 16x16",
            	    id: 14,
            	    webGlFunc: WebGlBwDither.creatOrderedDither(16),
            	},
            ];
            
    var colorDitherAlgorithms = [
                {
                    title: "Closest Color", 
                    id: 16,
                    webGlFunc: WebGlColorDither.closestColor,
                },
                {
                    title: "Ordered Dither 2x2", 
                    id: 17,
                    webGlFunc: WebGlColorDither.createOrderedDither(2),
                },
                {
                    title: "Ordered Dither 4x4", 
                    id: 18,
                    webGlFunc: WebGlColorDither.createOrderedDither(4),
                },
                {
                    title: "Ordered Dither 8x8", 
                    id: 19,
                    webGlFunc: WebGlColorDither.createOrderedDither(8),
                },
                {
                    title: "Ordered Dither 16x16", 
                    id: 20,
                    webGlFunc: WebGlColorDither.createOrderedDither(16),
                },
            ];
            
    
    
    return {
        ditherAlgorithms: ditherAlgorithms,
        colorDitherAlgorithms: colorDitherAlgorithms,
    };
    
})(App.WebGlBwDither, App.WebGlColorDither);