App.ColorPalettes = (function(ArrayUtil){
    
    function defaultPalettes(){
        return [
            {title: '---', isCustom: true},
            {title: 'Elevate', colors: ['#201A0B', '#fcfae2', '#492910', '#a9220f', '#2b347c', '#F4B38A', '#fce76e', '#2b7409', '#080000', '#6a94ab', '#d0ca40', '#234309', '#ac3cc6', '#510711', '#351757']},
            {title: 'Primaries', colors: ['#000000', '#ffffff', '#c40000', '#000075', '#ffff8a', '#6f207a', '#f8c2f7', '#22531a', '#ff8800', '#40321e', '#485ca4', '#87d255', '#e065de', '#5c373f', '#dbd21a']},
            {title: 'Galaxy', colors: ['#0d3677', '#D2ebf0', '#763a70', '#f9d2f4', '#242440', '#cd20cd', '#c5c565', '#b17633', '#554d28', '#2e337a', '#fefde9', '#181823', '#bda833', '#c866c4', '#914343']},
            {title: 'Ketchup', colors: ['#074400', '#fed9ff', '#ca0d0d', '#e1fade', '#7d3190', '#291a21', '#f5f5b6', '#14361f', '#516f31', '#da3f69', '#432446', '#5e111d', '#5d5a23', '#d6d5b3', '#485647']},
            {title: 'Pueblo', colors: ['#060338', '#fadafe', '#bd6a2d', '#e4fafc', '#e2a867', '#203e8a', '#cd3232', '#3f7c62', '#7a3046', '#eae0a8', '#252645', '#fbcfa4', '#2d4130', '#decfb5', '#fce8ec']},
            {title: 'Kelp', colors: ['#22a828', '#f2e659', '#e56e48', '#181f32', '#b28fc3', '#99d09a', '#52774d', '#592234', '#d4124a', '#d1ded8', '#b77315', '#ce4c2a', '#483e49', '#53a649', '#c6d884']},
            {title: 'Seance', colors: ['#28012e', '#fcfde1', '#eedb51', '#8ab32d', '#852d97', '#271784', '#a93e2e', '#613f4e', '#332b80', '#4d1a1a', '#355a25', '#287177', '#332a34', '#203621', '#cfc65e']},
            {title: 'Rose', colors: ['#d25c5b', '#882840', '#540e3a', '#eecfb7', '#540e3a', '#e2786e', '#ad424d', '#ec9f74', '#a07894', '#662041', '#76407e', '#571a48', '#af3535', '#ba2941', '#D1794E']},
            {title: 'Wildfire', colors: ['#e8d566', '#bf1c1c', '#df4f4f', '#500c0e', '#dfb34a', '#9b3737', '#2c3f1f', '#ddf2c6', '#292114', '#fdeefd', '#443858', '#ebb8f8', '#dddb9b', '#f0cfc0', '#27212b']},
            {title: 'Blueberry', colors: ['#00042b', '#fffff4', '#2459bd', '#649bf7', '#4d2266', '#2d1838', '#ede7bc', '#2d5b77', '#9e99dd', '#95fdb4', '#3a763c', '#fcd9b1', '#2b2eb3', '#9ab09f', '#e5ccec']},
            {title: 'Lilac', colors: ['#1f1320', '#fae8fd', '#61679e', '#c49bd2', '#362f62', '#9bc8ca', '#d1ded3', '#ddf2c6', '#8b4766', '#e9e4cf', '#54456d', '#d9a659', '#724b83', '#f4eec3', '#efddd5']},
            {title: 'Sepia', colors: ['#301A1A', '#D9CBC0', '#683737', '#B39076', '#3F0C03', '#1D1919', '#64543C', '#9E8C72', '#F3EBE3', '#7D3A0E', '#59332C', '#F0C592', '#312a28', '#f5eadc', '#493826']},
            {title: 'Lichen', colors: ['#151b12', '#f2fff0', '#89a240', '#bced8f', '#645c24', '#31291a', '#d9f0b9', '#bfc24b', '#936628', '#fafbca', '#743916', '#84792d', '#4a602f', '#c8d8aa', '#ededb3']},
            {title: 'Bronze', colors: ['#a98134', '#fffee6', '#6d4e2e', '#e4cfa3', '#212c1f', '#fbf5b5', '#d0d8ba', '#453621', '#d2d06a', '#1b1614', '#9f6835', '#85a277', '#324625', '#d6ebc2', '#6f7a63']},
            {title: 'Shamrock', colors: ['#a9a0a8', '#044040', '#c3b448', '#dcb3fd', '#19c778', '#c4f3d1', '#56e22f', '#cd814b', '#23afed', '#617b2f', '#17e681', '#1d9c4b', '#79d47a', '#f2efc7', '#1c4c0d']},
            {title: 'Sandcastle', colors: ['#111d84', '#daf9fe', '#db6b1a', '#4377d8', '#29106d', '#f8d792', '#c7c0d3', '#242626', '#dddb75', '#9ce4ca', '#426f50', '#fde0c1', '#805d2b', '#1b1744', '#543406']},
            {title: 'Apricot', colors: ['#18191b', '#30376d', '#daf9fe', '#d6860c', '#6089d6', '#2d2752', '#eee07d', '#99dbd6', '#d9d519', '#558d79', '#baa06d', '#1768ce', '#d56002', '#e8f3fb', '#a15300']},
            {title: 'Patina', colors: ['#946146', '#5edfe5', '#427c88', '#98744a', '#ce6f41', '#41363c', '#ffebca', '#1a3236', '#d68760', '#803942', '#ebbf8e', '#0bb0c6', '#18556a', '#347b67', '#eefcf7']},
            {title: 'Goldust', colors: ['#060606', '#f0f1ec', '#648eae', '#a69ae2', '#905b01', '#1e2649', '#e9e431', '#46a497', '#b66749', '#afbee7', '#e1e7c3', '#ad4f01', '#f4ee8d', '#314135', '#d8dc5f']},
            {title: 'Brass', colors: ['#648eae', '#ece50a', '#a69ae2', '#845320', '#35a495', '#c0a955', '#1e2649', '#afbee7', '#e1e7c3', '#ad4f01', '#f0f1ec', '#060606', '#f3efd2', '#f3db19', '#e69f3a']},
            {title: 'Wildberry', colors: ['#e7bc66', '#f96226', '#82ded0', '#c8b983', '#96192d', '#7aa8d5', '#a503d1', '#3f066f', '#57043a', '#de8786', '#db516a', '#738199', '#2b2937', '#9152b4', '#f8d5b9']},
            {title: 'Sunny', colors: ['#9b656c', '#a201ef', '#a30528', '#19248d', '#d9eb89', '#96c6c5', '#9b1d2f', '#053646', '#6f6cf1', '#ec23ec', '#1332a2', '#36104a', '#3d967f', '#342b37', '#f0f2a7']},
            {title: 'Neon', colors: ['#a101a9', '#a9a0f3', '#2c1a5e', '#8f269c', '#69ba2d', '#faa5cc', '#c5967b', '#feb180', '#51e00f', '#26c6c6', '#9ffd5d', '#bd1870', '#2e1e2d', '#9249a0', '#d4e860']},
            {title: 'Watermelon', colors: ['#8cc386', '#ce54d5', '#392f4e', '#be7dee', '#64b907', '#0c757b', '#fd0d0f', '#de2969', '#b9d4c3', '#d87a64', '#94d076', '#d47caf', '#263822', '#f0dcf3', '#e9d2c7']},
            {title: 'Crystals', colors: ['#a0d5c2', '#054b9c', '#013faf', '#bff698', '#52a297', '#d12b4c', '#4319aa', '#ea11a7', '#cb9045', '#fb7198', '#370107', '#107679', '#24243d', '#eaeacf', '#492a4d']},
        ];
    }

    function getPalettes(minimumColorsLength){
        return padPaletteColorsToMinimumLength(defaultPalettes(), minimumColorsLength);
    }

    //make sure each palette has at least the minimum number of colors
    function padPaletteColorsToMinimumLength(palettes, minimumColorsLength){
        return palettes.map((palette)=>{
            if(!palette.isCustom && palette.colors.length < minimumColorsLength){
                palette.colors = palette.colors.concat(ArrayUtil.create(minimumColorsLength - palette.colors.length, ()=>{
                    return '#000000';
                }));
            }
            return palette;
        });
    }

    function generateUserSavedPaletteTitle(savedPaletteId){
        return `Saved Palette ${savedPaletteId}`;
    }

    function generateUserSavedPalette(colors, savedPaletteId){
        return {
            title: generateUserSavedPaletteTitle(savedPaletteId),
            colors: colors,
            isSaved: true,
        };
    }
    
    return {
        get: getPalettes,
        generateUserSavedPalette,
        padPaletteColorsToMinimumLength,
    };
    
})(App.ArrayUtil);