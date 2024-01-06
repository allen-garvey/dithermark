//module for utility functions shared between bw and color webgl ditherls

//for some reason, the interaction between the random seed
//and the webgl pseduo-random function produces unpleasant looking artifacts (i.e. diagonal and occasionally horizontal lines)
//for certain values of the random seed
//the main cause seems to be when the random seed is less than 0.27 or so
//this fix doesn't 100% solve the problem (as there seems to be other causes as well),
//but it is rare enough to be acceptable for now
export const generateRandomSeed = () => Math.random() * 0.73 + 0.27;
