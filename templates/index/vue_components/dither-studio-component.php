<div>
    <div class="controls" v-cloak>
        <div class="controls-toplevel-container">
            <div>
                <button v-on:click="loadImageTrigger" title="Open local image file">Open image</button>
                <button v-on:click="loadRandomImage" v-bind:disabled="isCurrentlyLoadingRandomImage" title="Load random image from Unsplash">Random image</button>    
            </div>
        </div>
        <div class="image-title-container">
            <h3 class="image-title">{{saveImageFileName}}</h3>
        </div>
        <div class="controls-secondlevel-container" v-show="isImageLoaded">
            <div class="controls-panel">
                <div class="tabs-container">
                    <template v-for="(tabName, index) in ['Image', 'Settings', 'Export']">
                        <div class="tab" v-bind:class="{active: activeControlsTab === index}" v-on:click="activeControlsTab = index">{{tabName}}</div>
                    </template>
                </div>
                <?php foreach(['controls-tab-image.php', 'controls-tab-settings.php', 'controls-tab-export.php'] as $index => $templateFileName): ?>
                    <div class="controls-tab-container" v-show="activeControlsTab === <?= $index; ?>">
                        <?php require(TEMPLATES_TABS_PATH.$templateFileName); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <div class="super-dither-controls-container" v-bind:class="{'fixed-controls': areDitherControlsPinned}">
                <div class="tabs-container">
                    <div class="tab" v-bind:class="{active: activeDitherTab === 0}" v-on:click="loadDitherTab(0)">BW Dither</div>
                    <div class="tab" v-bind:class="{active: activeDitherTab === 1}" v-on:click="loadDitherTab(1)">Color Dither</div>
                </div>
                <div v-show="activeDitherTab === 0">
                    <bw-dither-section ref="bwDitherSection" v-on:request-worker="onWorkerRequested" v-on:display-transformed-image="zoomImage" v-bind:transform-canvas-web-gl="transformCanvasWebGl" v-bind:transform-canvas="transformCanvas" v-bind:source-canvas="sourceCanvas" v-bind:is-webgl-enabled="isWebglEnabled" v-bind:is-webgl-supported="isWebglSupported" v-bind:is-live-preview-enabled="isLivePreviewEnabled" />  
                </div>
                <div v-show="activeDitherTab === 1">
                    <color-dither-section ref="colorDitherSection" v-on:request-worker="onWorkerRequested" v-on:display-transformed-image="zoomImage" v-bind:transform-canvas-web-gl="transformCanvasWebGl" v-bind:transform-canvas="transformCanvas" v-bind:source-canvas="sourceCanvas" v-bind:is-webgl-enabled="isWebglEnabled" v-bind:is-webgl-supported="isWebglSupported" v-bind:is-live-preview-enabled="isLivePreviewEnabled" />
                </div>
            </div>
        </div>
    </div>
    <div class="image-canvas-container" v-bind:class="{'show-original': showOriginalImage}">
        <canvas ref="saveImageCanvas" class="hidden"></canvas><?php //used when saving image, so pixelated images are scaled correctly ?>
        <canvas ref="originalImageCanvas" class="hidden"></canvas><?php //original non-pixelated image loaded by user ?>
        <canvas ref="sourceCanvas" class="hidden"></canvas><?php //pixelated-image used as source to dithers ?>
        <canvas ref="transformCanvas" class="hidden"></canvas><?php //output from dither ?>
        <canvas ref="transformCanvasWebgl" class="hidden"></canvas><?php //output from webgl, copied to above because otherwise chrome will freak out when we change tabs ?>
        <canvas ref="sourceCanvasOutput" class="output-canvas" v-show="showOriginalImage"></canvas><?php //original image as displayed to the user, after zoomed and pixelated ?>
        <canvas ref="transformCanvasOutput" class="output-canvas"></canvas><?php //output from dither as shown to user, after zoom ?>
    </div>
</div>