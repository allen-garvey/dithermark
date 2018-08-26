
const fullScreenPrefixes = Object.freeze({
    WEBKIT: Object.freeze({
        isEnabled: 'webkitFullscreenEnabled',
        isCurrentlyFullScreen: 'webkitFullscreenElement',
        change: 'onwebkitfullscreenchange',
        request: 'webkitRequestFullscreen',
        exit: 'webkitExitFullscreen',
    }),
    MOZ: Object.freeze({
        isEnabled: 'mozFullScreenEnabled',
        isCurrentlyFullScreen: 'mozFullScreenElement',
        change: 'onmozfullscreenchange',
        request: 'mozRequestFullScreen',
        exit: 'mozCancelFullScreen',
    }),
});

let fullScreenPrefix = null;

function getFullScreenPrefix(){
    for(let key in fullScreenPrefixes){
        if(document[fullScreenPrefixes[key].isEnabled]){
            return key;
        }
    }

    return null;
}

export default{
    name: 'full-screen-mode-control',
    template: document.getElementById('full-screen-mode-control-component'),
    created(){
        fullScreenPrefix = getFullScreenPrefix();
        if(fullScreenPrefix != null){
            this.isFullScreenModeSupported = true;
            document[fullScreenPrefixes[fullScreenPrefix].change] = this.fullScreenModeChanged;
        }
    },
    data(){
        return {
            isFullScreen: false,
            isFullScreenModeSupported: false,
        };
    },
    watch: {
        isFullScreen(newValue){
            const classList = document.body.classList;
            const className = 'full-screen-mode';
            if(newValue){
                classList.add(className);
            }
            else{
                classList.remove(className);
            }
        },
    },
    methods: {
        fullScreenModeChanged(e){
            this.isFullScreen = document[fullScreenPrefixes[fullScreenPrefix].isCurrentlyFullScreen];
        },
        toggleFullScreenMode(){
            if(this.isFullScreen){
                this.deactivateFullScreenMode();
            }
            else{
                this.activateFullScreenMode();
            }
        },
        activateFullScreenMode(){
            document.body[fullScreenPrefixes[fullScreenPrefix].request]();
        },
        deactivateFullScreenMode(){
            document[fullScreenPrefixes[fullScreenPrefix].exit]();
        },
    },
};