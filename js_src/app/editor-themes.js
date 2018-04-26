App.EditorThemes = (function(){
    function EditorTheme(name, key){
        this.name = name;
        this.className = `editor-${name.toLowerCase()}`;
        this.key = key;
    }

    function themes(){
        return [
                new EditorTheme('White', 0),
                new EditorTheme('Light', 1),
                new EditorTheme('Dark', 2),
                new EditorTheme('Black', 3),
            ];
    }

    function indexForKey(themes, key){
        for(let i=0;i<themes.length;i++){
            if(themes[i].key === key){
                return i;
            }
        }
        
        return 0;
    }

    return {
        get: themes,
        indexForKey,
    };
})();