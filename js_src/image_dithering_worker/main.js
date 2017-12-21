var ditherAlgorithms = [
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

var messageInSequence = 0;
var messageHeader = {};

onmessage = function(e) {
    messageInSequence++;
    var messageData = e.data;
    
    if(messageInSequence === 1){
        messageHeader.imageWidth = messageData[0];
        messageHeader.imageHeight = messageData[1];
        messageHeader.threshold = messageData[2];
        messageHeader.algorithmId = messageData[3];
        return;
    }
    else{
        messageInSequence = 0;
    }
    
    var imageDataBuffer = messageData;
    var pixels = new Uint8ClampedArray(imageDataBuffer);
    
    var imageHeight = messageHeader.imageHeight;
    var imageWidth = messageHeader.imageWidth;
    var threshold = messageHeader.threshold;
    var algorithmId = messageHeader.algorithmId;
    
    var selectedAlgorithm = ditherAlgorithms[algorithmId - 1];
    App.Timer.time(selectedAlgorithm.title, ()=>{
       imageDataBuffer = selectedAlgorithm.algorithm(pixels, imageWidth, imageHeight, threshold); 
    });
    
    postMessage(imageDataBuffer);
}