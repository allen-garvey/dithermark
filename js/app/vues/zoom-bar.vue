<template>
    <div :class="$style.zoomContainer">
        <div :class="$style.controls">
            <label for="zoom-bar-range">Zoom</label>
            <input 
                id="zoom-bar-range" 
                type="range" 
                :min="zoomMin" 
                :max="zoomMax" 
                v-model.number="zoom"
            />
            <input 
                type="number" 
                :min="zoomMin" 
                :max="zoomMax" 
                v-model.number="zoomDisplay" 
                @keyup.enter="zoom = zoomDisplay"
            />
        </div>
        <div :class="$style.buttonContainer">
            <button 
                class="btn btn-default btn-sm" 
                :class="$style.zoomFitButton"
                @click="zoomFit" 
                title="Fit image on screen"
            >
                Fit
            </button>
            <button 
                class="btn btn-default btn-sm" 
                v-show="zoom !== 100" 
                @click="resetZoom" 
                title="Reset zoom to 100%"
            >
                Full
            </button>
        </div>
    </div>
</template>

<style lang="scss" module>
    .zoomContainer{
        @include mixins.background_color_transition;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-end;
        padding: 4px variables.$global_horizontal_padding;
    }

    .controls{
        display: flex;
        align-items: flex-end;
        flex-basis: 100%;
        margin-bottom: 12px;
        //max width required for Microsoft Edge at small screen sizes, otherwise it keeps expanding
        max-width: calc(100vw - #{variables.$chrome_fullscreen_horizontal_scrollbar_height});
        input[type="range"]{
            flex-basis: calc(100% - 138px);
            vertical-align: bottom;
        }
        label{
            align-self: center;
        }
    }

    .zoomFitButton{
        margin-right: 16px;
    }

    .buttonContainer{
        display: flex;
        justify-content: space-between;
        width: variables.$zoom_bar_button_container_width;
    }

    @include mixins.pinned_controls_mq{
        .zoomContainer{
            font-size: 12px;
            position: fixed;
            z-index: 10;
            bottom: 0;
            left: 0;
            background-color: var(--pinned-controls-bg-color);
            box-sizing: border-box;
            border-top: variables.$controls_border;
            //-1 pixel so it hides border
            width: calc(100% - #{variables.$pinned_dither_controls_width});
        }
        .controls{
            // align-items: baseline;
            flex-basis: calc(100% - #{variables.$zoom_bar_button_container_width});
            margin-bottom: 0;
        }
        .zoomFitButton{
            margin-right: 0;
        }
    }

    @media all and (display-mode: fullscreen) {
        .zoomContainer {
            bottom: variables.$chrome_fullscreen_horizontal_scrollbar_height;
             
            body:-moz-full-screen & {
                bottom: 0;
            }
        }
    }
</style>

<script>
    import Canvas from '../canvas.js';


    //maximum allowed size is largest size in pixels image is allowed to be
    function maxScalePercentageForImage(imageWidth, imageHeight, maximumAllowedSize){
        const largestDimension = Math.max(imageWidth, imageHeight);
        const largestPercentage = Math.ceil(maximumAllowedSize * 100 / largestDimension);
        
        //make sure the maximum percentage is at least 200
        return Math.max(largestPercentage, 200);
    }

    //minimum allowed size is smallest size in pixels image is allowed to be
    function minScalePercentageForImage(imageWidth, imageHeight, minimumAllowedSize){
        const smallestDimension = Math.min(imageWidth, imageHeight);
        const smallestPercentage = Math.ceil(minimumAllowedSize * 100 / smallestDimension);
        
        //make sure at most 100 is returned
        return Math.min(smallestPercentage, 100);
    }

    export default {
        props: {
            showOriginalImage: {
                type: Boolean,
                required: true,
            },
            zoomChanged: {
                type: Function,
                required: true,
            },
            requestDimensionsForZoomFit: {
                type: Function,
                required: true,
            },
        },
        data(){
            return {
                //has to be static property instead of prop from dither-studio component, because it will not be updated
                //soon enough when image loades
                image: null,
                zoom: 100,
                //so invalid zoom levels can be incrementally typed into input box, and not immediately validated and changed
                zoomDisplay: 100,
            };
        },
        computed: {
            zoomMin(){
                if(!this.isImageLoaded){
                    return 0;
                }
                const smallestDimension = Math.floor(Math.min(window.innerHeight, window.innerWidth) / 2 / Canvas.devicePixelRatio);
                return minScalePercentageForImage(this.image.width, this.image.height, Math.min(100, smallestDimension));
            },
            zoomMax(){
                if(!this.isImageLoaded){
                    return 0;
                }
                const greatestDimension = Math.max(window.innerHeight, window.innerWidth) * 2 * Canvas.devicePixelRatio;
                return maxScalePercentageForImage(this.image.width, this.image.height, greatestDimension);
            },
            isImageLoaded(){
                return this.image != null;  
            },
        },
        watch: {
            zoomDisplay(newValue){
                //have to check if not equal to this.zoom, or will start infinite loop
                if(newValue !== this.zoom && newValue >= this.zoomMin && newValue <= this.zoomMax){
                    this.zoom = newValue;
                }
            },
            zoom(newZoom, oldZoom){
                if(newZoom === oldZoom){
                    return;
                }
                let newZoomCleaned = Math.floor(newZoom);
                if(isNaN(newZoomCleaned)){
                    this.zoom = oldZoom;
                    return;
                }
                if(newZoomCleaned < this.zoomMin){
                    newZoomCleaned = this.zoomMin;
                }
                else if(newZoomCleaned > this.zoomMax){
                    newZoomCleaned = this.zoomMax;
                }
                if(newZoomCleaned !== newZoom){
                    this.zoom = newZoomCleaned;
                    return;
                }
                this.zoomDisplay = this.zoom;
                this.zoomChanged();
            },
        },
        methods: {
            resetZoom(){
                this.zoom = 100;
            },
            //fit image onto screen
            zoomFit(){
                const image = this.image;
                //if original image is show, image is technically twice as wide
                const widthMultiplier = this.showOriginalImage ? 50 : 100;
                //if controls are pinned, we need to subtract the width of controls
                let windowWidth = window.innerWidth;

                this.requestDimensionsForZoomFit((areControlsPinned, controlsContainerWidth, canvasMargin)=>{
                    if(areControlsPinned){
                        windowWidth -= controlsContainerWidth;
                    }
                    if(this.showOriginalImage){
                        //2*margin is to give some horizontal padding on each side so edges are not cut off
                        windowWidth -= 2 * canvasMargin;
                    }
                    else if(!areControlsPinned){
                        //when controls are pinned single image fits fine, but needs a bit of extra room on mobile
                        windowWidth -= 20;
                    }
                    let windowHeight = window.innerHeight;
                    //if zoom bar is pinned, we need to subtract height of zoom bar
                    const zoomBarContainer = this.$el;
                    if(getComputedStyle(zoomBarContainer).getPropertyValue('position') === 'fixed'){
                        const zoomBarHeight = zoomBarContainer.offsetHeight;
                        //add slightly more than zoomBarHeight so there is some padding
                        windowHeight -= 1.6 * zoomBarHeight;
                    }
                    const widthFitPercentage = Math.floor(windowWidth / image.width * widthMultiplier);
                    const heightFitPercentage = Math.floor(windowHeight / image.height * 100);
                    this.zoom = Math.min(widthFitPercentage, heightFitPercentage);
                });
            },
        },
    };
</script>
