<template>
    <div v-if="isFullScreenModeSupported">
        <button class="btn btn-default btn-sm" @click="toggleFullScreenMode">{{isFullScreen ? 'Exit fullscreen' : 'Fullscreen mode'}}</button>
    </div>
</template>


<script>
const fullScreenConfigs = [
    {
        isEnabled: 'fullscreenEnabled',
        isCurrentlyFullScreen: 'fullscreenElement',
        change: 'onfullscreenchange',
        request: 'requestFullscreen',
        exit: 'exitFullscreen',
    },
    {
        isEnabled: 'webkitFullscreenEnabled',
        isCurrentlyFullScreen: 'webkitFullscreenElement',
        change: 'onwebkitfullscreenchange',
        request: 'webkitRequestFullscreen',
        exit: 'webkitExitFullscreen',
    },
];

function getFullScreenConfig(){
    for(let config of fullScreenConfigs){
        if(document[config.isEnabled]){
            return config;
        }
    }

    return null;
}

export default {
    created(){
        this.fullScreenConfig = getFullScreenConfig();
        if(this.fullScreenConfig){
            document[this.fullScreenConfig.change] = this.fullScreenModeChanged;
        }
    },
    data(){
        return {
            isFullScreen: false,
            fullScreenConfig: null,
        };
    },
    computed: {
        isFullScreenModeSupported(){
            return !!this.fullScreenConfig;
        },
    },
    methods: {
        fullScreenModeChanged(e){
            this.isFullScreen = document[this.fullScreenConfig.isCurrentlyFullScreen];
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
            document.body[this.fullScreenConfig.request]();
        },
        deactivateFullScreenMode(){
            document[this.fullScreenConfig.exit]();
        },
    },
};
</script>