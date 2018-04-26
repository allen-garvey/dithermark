App.EditorThemes = (function(){
    function EditorTheme(name){
        this.name = name;
        this.className = `editor-${name.toLowerCase()}`;
    }

    function themes(){
        return [
                new EditorTheme('White'),
                new EditorTheme('Light'),
                new EditorTheme('Dark'),
                new EditorTheme('Black'),
            ];
    }

    return {
        get: themes,
    };
})();