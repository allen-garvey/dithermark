App.ColorPalettes = (function(){
    
    function getPalettes(){
        return [
            {title: 'Custom', isCustom: true},
            {title: 'Uniform', colors: ['#201e22', '#ebe1e6', '#a82828', '#ebeb2d', '#795633', '#2d5b2d', '#267ace', '#d69e75', '#2c3838', '#62c7ea', '#b3a2c9', '#a7c38b']},
            {title: 'Uniform 2', colors: ['#211e22', '#e3ebe1', '#32423e', '#d1dfa5', '#2e3a5e', '#793368', '#2888a8', '#ce5026', '#ebbc2d', '#54e879', '#9a85db', '#e0c8ce']},
            {title: 'Primaries', colors: ['#000000', '#ffffff', '#c40000', '#000075', '#ffff8a', '#6f207a', '#f8c2f7', '#22531a', '#ff8800', '#40321e', '#485ca4', '#87d255']},
            {title: 'Galaxy', colors: ['#0d3677', '#D2ebf0', '#763a70', '#f9d2f4', '#242440', '#cd20cd', '#c5c565', '#b17633', '#554d28', '#2e337a', '#fefde9', '#181823']},
            {title: 'Ketchup', colors: ['#074400', '#fed9ff', '#ca0d0d', '#e1fade', '#7d3190', '#291a21', '#f5f5b6', '#14361f', '#516f31', '#da3f69', '#432446', '#5e111d']},
            {title: 'Pueblo', colors: ['#060338', '#fadafe', '#bd6a2d', '#e4fafc', '#e2a867', '#203e8a', '#cd3232', '#3f7c62', '#7a3046', '#eae0a8', '#252645', '#fbcfa4']},
            {title: 'Kelp', colors: ['#22a828', '#f2e659', '#e56e48', '#181f32', '#b28fc3', '#99d09a', '#52774d', '#592234', '#d4124a', '#d1ded8', '#b77315', '#ce4c2a']},
            {title: 'Seance', colors: ['#28012e', '#fcfde1', '#eedb51', '#8ab32d', '#852d97', '#271784', '#a93e2e', '#613f4e', '#332b80', '#4d1a1a', '#355a25', '#287177']},
            {title: 'Rose', colors: ['#200d10', '#fff2f2', '#c91837', '#f87263', '#790f47', '#4d2030', '#f1cdb8', '#ec2f13', '#ef3d4a', '#c1311c', '#371340', '#ffe1d5']},
            {title: 'Wildfire', colors: ['#e8d566', '#bf1c1c', '#df4f4f', '#500c0e', '#dfb34a', '#9b3737', '#2c3f1f', '#ddf2c6', '#292114', '#fdeefd', '#443858', '#ebb8f8']},
            {title: 'Blueberry', colors: ['#00042b', '#fffff4', '#2459bd', '#649bf7', '#4d2266', '#2d1838', '#ede7bc', '#2d5b77', '#9e99dd', '#95fdb4', '#3a763c', '#fcd9b1']},
            {title: 'Lilac', colors: ['#1f1320', '#fae8fd', '#61679e', '#c49bd2', '#362f62', '#9bc8ca', '#d1ded3', '#ddf2c6', '#8b4766', '#e9e4cf', '#54456d', '#d9a659']},
            {title: 'Lichen', colors: ['#151b12', '#f2fff0', '#89a240', '#bced8f', '#645c24', '#31291a', '#d9f0b9', '#bfc24b', '#936628', '#fafbca', '#743916', '#84792d']},
            {title: 'Bronze', colors: ['#a98134', '#fffee6', '#6d4e2e', '#e4cfa3', '#212c1f', '#fbf5b5', '#d0d8ba', '#453621', '#d2d06a', '#1b1614', '#9f6835', '#85a277']},
            {title: 'Shamrock', colors: ['#a9a0a8', '#044040', '#c3b448', '#dcb3fd', '#19c778', '#c4f3d1', '#56e22f', '#cd814b', '#23afed', '#617b2f', '#17e681', '#1d9c4b']},
            {title: 'Sandcastle', colors: ['#111d84', '#daf9fe', '#db6b1a', '#4377d8', '#29106d', '#f8d792', '#c7c0d3', '#242626', '#dddb75', '#9ce4ca', '#426f50', '#fde0c1']},
            {title: 'Orange & Teal', colors: ['#18191b', '#30376d', '#daf9fe', '#d6860c', '#6089d6', '#2d2752', '#eee07d', '#99dbd6', '#d9d519', '#558d79', '#baa06d', '#1768ce']},
            {title: 'Goldust', colors: ['#060606', '#f0f1ec', '#648eae', '#a69ae2', '#905b01', '#1e2649', '#e9e431', '#46a497', '#b66749', '#afbee7', '#e1e7c3', '#ad4f01']},
            {title: 'Brass', colors: ['#648eae', '#ece50a', '#a69ae2', '#845320', '#35a495', '#c0a955', '#1e2649', '#afbee7', '#e1e7c3', '#ad4f01', '#f0f1ec', '#060606']},
            {title: 'Wildberry', colors: ['#e7bc66', '#f96226', '#82ded0', '#c8b983', '#96192d', '#7aa8d5', '#a503d1', '#3f066f', '#57043a', '#de8786', '#db516a', '#738199']},
            {title: 'Sunny', colors: ['#9b656c', '#a201ef', '#a30528', '#19248d', '#d9eb89', '#96c6c5', '#9b1d2f', '#053646', '#6f6cf1', '#ec23ec', '#1332a2', '#36104a']},
            {title: 'Neon', colors: ['#a101a9', '#a9a0f3', '#2c1a5e', '#8f269c', '#69ba2d', '#faa5cc', '#c5967b', '#feb180', '#51e00f', '#26c6c6', '#9ffd5d', '#bd1870']},
            {title: 'Watermelon', colors: ['#8cc386', '#ce54d5', '#392f4e', '#be7dee', '#64b907', '#0c757b', '#fd0d0f', '#de2969', '#b9d4c3', '#d87a64', '#94d076', '#d47caf']},
            {title: 'Crystals', colors: ['#a0d5c2', '#054b9c', '#013faf', '#bff698', '#52a297', '#d12b4c', '#4319aa', '#ea11a7', '#cb9045', '#fb7198', '#370107', '#107679']},
        ];
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
    };
    
})();