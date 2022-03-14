<template>
    <div v-if="isFullScreenModeSupported">
        <button class="btn btn-default btn-sm" @click="toggleFullScreenMode">{{isFullScreen ? 'Exit fullscreen' : 'Fullscreen mode'}}</button>
    </div>
</template>


<script>
const fullScreenPrefixes = Object.freeze({
    STANDARD: Object.freeze({
        isEnabled: 'fullscreenEnabled',
        isCurrentlyFullScreen: 'fullscreenElement',
        change: 'onfullscreenchange',
        request: 'requestFullscreen',
        exit: 'exitFullscreen',
    }),
    WEBKIT: Object.freeze({
        isEnabled: 'webkitFullscreenEnabled',
        isCurrentlyFullScreen: 'webkitFullscreenElement',
        change: 'onwebkitfullscreenchange',
        request: 'webkitRequestFullscreen',
        exit: 'webkitExitFullscreen',
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

export default {
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
</script>