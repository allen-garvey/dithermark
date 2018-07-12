(function(Vue, Canvas){
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

    Vue.component('zoom-bar', {
        template: document.getElementById('zoom-bar-component'),
        props: ['show-original-image', 'zoom-changed', 'request-dimensions-for-zoom-fit'],
        data: function(){
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
            zoomMin: function(){
                if(!this.isImageLoaded){
                    return 0;
                }
                const smallestDimension = Math.floor(Math.min(window.innerHeight, window.innerWidth) / 2 / Canvas.devicePixelRatio);
                return minScalePercentageForImage(this.image.width, this.image.height, Math.min(100, smallestDimension));
            },
            zoomMax: function(){
                if(!this.isImageLoaded){
                    return 0;
                }
                const greatestDimension = Math.max(window.innerHeight, window.innerWidth) * 2 * Canvas.devicePixelRatio;
                return maxScalePercentageForImage(this.image.width, this.image.height, greatestDimension);
            },
            isImageLoaded: function(){
              return this.image != null;  
            },
        },
        watch: {
            zoomDisplay: function(newValue){
                //have to check if not equal to this.zoom, or will start infinite loop
                if(newValue !== this.zoom && newValue >= this.zoomMin && newValue <= this.zoomMax){
                    this.zoom = newValue;
                }
            },
            zoom: function(newZoom, oldZoom){
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
            resetZoom: function(){
                this.zoom = 100;
            },
            //fit image onto screen
            zoomFit: function(){
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
    });
})(window.Vue, App.Canvas);