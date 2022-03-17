export const getDitherTabs = (clicked) => {
    // note that clicked function will not work correctly if tabs are reordered
    // for that you will need to change the bwDitherComponentId and colorDitherComponentId variable indexes 
    
    return [
        {
            name: 'BW Dither',
            clicked,
        },
        {
            name: 'Color Dither',
            clicked,
        },
    ];
};
