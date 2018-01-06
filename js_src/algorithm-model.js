App.AlgorithmModel = (function(WebGl){
    var ditherAlgorithms = [
                {
                    title: "Threshold", 
                    id: 1,
                    webGlFunc: WebGl.threshold,
                },
                {
                    title: "Random Threshold", 
                    id: 2,
                    webGlFunc: WebGl.randomThreshold,
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
            	    webGlFunc: WebGl.orderedDither2,
            	},
            	{
            	    title: "Ordered Dither 4x4",
            	    id: 12,
            	    webGlFunc: WebGl.orderedDither4,
            	},
            	{
            	    title: "Ordered Dither 8x8",
            	    id: 13,
            	    webGlFunc: WebGl.orderedDither8,
            	},
            	{
            	    title: "Ordered Dither 16x16",
            	    id: 14,
            	    webGlFunc: WebGl.orderedDither16,
            	},
            ];
    
    return {
        ditherAlgorithms: ditherAlgorithms,
    };
    
})(App.WebGl);