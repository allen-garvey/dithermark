
App.Algorithms = (function(){
    function ditherAlgorithms(){
        return {
                1: {
                    title: "Threshold", 
                    algorithm: App.Threshold.image,
                },
                2: {
                    title: "Random", 
                    algorithm: App.Threshold.randomDither,
                },
                3: {
                    title: "Atkinson", 
                    algorithm: App.ErrorPropDither.atkinson,
                    isErrorPropDither: true,
                },
                4: {
                    title: "Floyd-Steinberg", 
                    algorithm: App.ErrorPropDither.floydSteinberg,
                    isErrorPropDither: true,
                },
                5: {
            		title: "Javis-Judice-Ninke",
            		algorithm: App.ErrorPropDither.javisJudiceNinke,
            		isErrorPropDither: true,
            	},
            	6: {
            		title: "Stucki",
            		algorithm: App.ErrorPropDither.stucki,
            		isErrorPropDither: true,
            	},
            	7: {
            		title: "Burkes",
            		algorithm: App.ErrorPropDither.burkes,
            		isErrorPropDither: true,
            	},
            	8: {
            		title: "Sierra3",
            		algorithm: App.ErrorPropDither.sierra3,
            		isErrorPropDither: true,
            	},
            	9: {
            		title: "Sierra2",
            		algorithm: App.ErrorPropDither.sierra2,
            		isErrorPropDither: true,
            	},
            	10: {
            		title: "Sierra1",
            		algorithm: App.ErrorPropDither.sierra1,
            		isErrorPropDither: true,
            	},
            	11: {
            	    title: "Ordered Dither 2x2",
            	    algorithm: App.OrderedDither.createOrderedDither(2),
            	},
            	12: {
            	    title: "Ordered Dither 4x4",
            	    algorithm: App.OrderedDither.createOrderedDither(4),
            	},
            	13: {
            	    title: "Ordered Dither 8x8",
            	    algorithm: App.OrderedDither.createOrderedDither(8),
            	},
            	14: {
            	    title: "Ordered Dither 16x16",
            	    algorithm: App.OrderedDither.createOrderedDither(16),
            	},
            	15: {
            	    title: "Garvey",
            	    algorithm: App.ErrorPropDither.garvey,
            	    isErrorPropDither: true,
            	},
            };
    }
    
    
    
    return {
        model: ditherAlgorithms,
    };
})(App);