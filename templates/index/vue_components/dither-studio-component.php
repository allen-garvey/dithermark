<div>
    <div class="controls" :show="areWorkersInitialized">
        <div class="image-title-container">
            <h3 class="image-title">{{saveImageFileName}}</h3>
        </div>
        <div class="controls-container">
            <div class="global-controls-panel controls-panel">
                <div class="tabs-container">
                    <template v-for="(tab, index) in globalControlsTabs">
                        <div class="tab" v-bind:class="{active: activeControlsTab === index, disabled: tab.isDisabled}" v-on:click="setActiveControlsTab(index, tab.isDisabled)">{{tab.name}}</div>
                    </template>
                </div>
                <?php foreach(['open', 'image', 'settings', 'export'] as $index => $templateFileSuffix): ?>
                    <div class="controls-tab-container" v-show="activeControlsTab === <?= $index; ?>">
                        <?php require(TEMPLATES_TABS_PATH.'controls-tab-'.$templateFileSuffix.'.php'); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <div class="super-dither-controls-container" v-show="isImageLoaded">
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
        <div class="image-canvas-supercontainer" v-show="isImageLoaded">
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
</div>