var App = App || {};

App.Algorithms = (function(){
    function ditherAlgorithms(){
        return [
                {
                    title: "Threshold", 
                    algorithm: App.Threshold.image,
                },
                {
                    title: "Random", 
                    algorithm: App.Threshold.randomDither,
                },
                {
                    title: "Atkinson", 
                    algorithm: App.ErrorPropDither.atkinson,
                },
                {
                    title: "Floyd-Steinberg", 
                    algorithm: App.ErrorPropDither.floydSteinberg,
                },
                {
            		title: "Javis-Judice-Ninke",
            		algorithm: App.ErrorPropDither.javisJudiceNinke,
            	},
            	{
            		title: "Stucki",
            		algorithm: App.ErrorPropDither.stucki,
            	},
            	{
            		title: "Burkes",
            		algorithm: App.ErrorPropDither.burkes,
            	},
            	{
            		title: "Sierra3",
            		algorithm: App.ErrorPropDither.sierra3,
            	},
            	{
            		title: "Sierra2",
            		algorithm: App.ErrorPropDither.sierra2,
            	},
            	{
            		title: "Sierra1",
            		algorithm: App.ErrorPropDither.sierra1,
            	},
            	{
            	    title: "Ordered Dither 2x2",
            	    algorithm: App.OrderedDither.dither2,
            	},
            	{
            	    title: "Ordered Dither 4x4",
            	    algorithm: App.OrderedDither.dither4,
            	},
            	{
            	    title: "Ordered Dither 8x8",
            	    algorithm: App.OrderedDither.dither8,
            	},
            	{
            	    title: "Ordered Dither 16x16",
            	    algorithm: App.OrderedDither.dither16,
            	},
            ];
    }
    
    
    
    return {
        model: ditherAlgorithms,
    };
})(App);