
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
                },
                4: {
                    title: "Floyd-Steinberg", 
                    algorithm: App.ErrorPropDither.floydSteinberg,
                },
                5: {
            		title: "Javis-Judice-Ninke",
            		algorithm: App.ErrorPropDither.javisJudiceNinke,
            	},
            	6: {
            		title: "Stucki",
            		algorithm: App.ErrorPropDither.stucki,
            	},
            	7: {
            		title: "Burkes",
            		algorithm: App.ErrorPropDither.burkes,
            	},
            	8: {
            		title: "Sierra3",
            		algorithm: App.ErrorPropDither.sierra3,
            	},
            	9: {
            		title: "Sierra2",
            		algorithm: App.ErrorPropDither.sierra2,
            	},
            	10: {
            		title: "Sierra1",
            		algorithm: App.ErrorPropDither.sierra1,
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
            	},
            	16: {
            	    title: "Arithmetic Dither XOR 1",
            	    algorithm: App.Threshold.adither1,
            	},
            	17: {
            	    title: "Arithmetic Dither XOR 2",
            	    algorithm: App.Threshold.adither2,
            	},
            	18: {
            	    title: "Arithmetic Dither Add 1",
            	    algorithm: App.Threshold.adither3,
            	},
            	19: {
            	    title: "Arithmetic Dither Add 2",
            	    algorithm: App.Threshold.adither4,
            	},
            };
    }
    
    
    
    return {
        model: ditherAlgorithms,
    };
})(App);