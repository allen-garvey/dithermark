App.AlgorithmModel = (function(WebGlBwDither){
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
    
    return {
        ditherAlgorithms: ditherAlgorithms,
    };
    
})(App.WebGlBwDither);