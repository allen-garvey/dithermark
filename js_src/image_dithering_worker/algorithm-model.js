
App.Algorithms = (function(Threshold, OrderedDither, ErrorPropDither){
    function ditherAlgorithms(){
        return {
                1: {
                    title: "Threshold", 
                    algorithm: Threshold.image,
                },
                2: {
                    title: "Random", 
                    algorithm: Threshold.randomDither,
                },
                3: {
                    title: "Atkinson", 
                    algorithm: ErrorPropDither.atkinson,
                },
                4: {
                    title: "Floyd-Steinberg", 
                    algorithm: ErrorPropDither.floydSteinberg,
                },
                5: {
            		title: "Javis-Judice-Ninke",
            		algorithm: ErrorPropDither.javisJudiceNinke,
            	},
            	6: {
            		title: "Stucki",
            		algorithm: ErrorPropDither.stucki,
            	},
            	7: {
            		title: "Burkes",
            		algorithm: ErrorPropDither.burkes,
            	},
            	8: {
            		title: "Sierra3",
            		algorithm: ErrorPropDither.sierra3,
            	},
            	9: {
            		title: "Sierra2",
            		algorithm: ErrorPropDither.sierra2,
            	},
            	10: {
            		title: "Sierra1",
            		algorithm: ErrorPropDither.sierra1,
            	},
            	11: {
            	    title: "Ordered Dither 2x2",
            	    algorithm: OrderedDither.createOrderedDither(2),
            	},
            	12: {
            	    title: "Ordered Dither 4x4",
            	    algorithm: OrderedDither.createOrderedDither(4),
            	},
            	13: {
            	    title: "Ordered Dither 8x8",
            	    algorithm: OrderedDither.createOrderedDither(8),
            	},
            	14: {
            	    title: "Ordered Dither 16x16",
            	    algorithm: OrderedDither.createOrderedDither(16),
            	},
            	15: {
            	    title: "Garvey",
            	    algorithm: ErrorPropDither.garvey,
            	},
            	16: {
            	    title: "Arithmetic Dither XOR 1",
            	    algorithm: Threshold.aditherXor1,
            	},
            	17: {
            	    title: "Arithmetic Dither XOR 2",
            	    algorithm: Threshold.aditherXor2,
            	},
            	18: {
            	    title: "Arithmetic Dither XOR 3",
            	    algorithm: Threshold.aditherXor3,
            	},
            	19: {
            	    title: "Arithmetic Dither Add 1",
            	    algorithm: Threshold.aditherAdd1,
            	},
            	20: {
            	    title: "Arithmetic Dither Add 2",
            	    algorithm: Threshold.aditherAdd2,
            	},
            	21: {
            	    title: "Arithmetic Dither Add 3",
            	    algorithm: Threshold.aditherAdd3,
            	},
            };
    }
    
    
    
    return {
        model: ditherAlgorithms,
    };
})(App.Threshold, App.OrderedDither, App.ErrorPropDither);