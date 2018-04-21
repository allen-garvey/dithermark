<div>
    <div class="controls">
        <div class="controls-container">
            <div class="global-controls-panel controls-panel">
                <div class="tabs-container">
                    <template v-for="(tab, index) in globalControlsTabs">
                        <div class="tab" :class="{active: activeControlsTab === index, disabled: tab.isDisabled}" @click="setActiveControlsTab(index, tab.isDisabled)">{{tab.name}}</div>
                    </template>
                </div>
                <?php foreach(['open', 'image', 'settings', 'export'] as $index => $templateName): ?>
                    <div class="controls-tab-container" v-show="activeControlsTab === <?= $index; ?>">
                        <?php require(TEMPLATES_GLOBAL_CONTROLS_TABS_PATH.$templateName.'.php'); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <div class="super-dither-controls-container" v-show="isImageLoaded">
                <div class="tabs-container">
                    <div class="tab" :class="{active: activeDitherTab === 0}" @click="loadDitherTab(0)">BW Dither</div>
                    <div class="tab" :class="{active: activeDitherTab === 1}" @click="loadDitherTab(1)">Color Dither</div>
                </div>
                <div v-show="activeDitherTab === 0">
                    <bw-dither-section ref="bwDitherSection" @request-worker="onWorkerRequested" @display-transformed-image="zoomImage" :transform-canvas-web-gl="transformCanvasWebGl" :transform-canvas="transformCanvas" :source-canvas="sourceCanvas" :is-webgl-enabled="isWebglEnabled" :is-webgl-supported="isWebglSupported" :is-live-preview-enabled="isLivePreviewEnabled" />  
                </div>
                <div v-show="activeDitherTab === 1">
                    <color-dither-section ref="colorDitherSection" @request-modal-prompt="showModalPrompt" @request-worker="onWorkerRequested" @display-transformed-image="zoomImage" :transform-canvas-web-gl="transformCanvasWebGl" :transform-canvas="transformCanvas" :source-canvas="sourceCanvas" :is-webgl-enabled="isWebglEnabled" :is-webgl-supported="isWebglSupported" :is-live-preview-enabled="isLivePreviewEnabled" />
                </div>
            </div>
        </div>
        <div class="zoom-bar-container" v-show="isImageLoaded">
            <label>
                Zoom
                <input type="range" :min="zoomMin" :max="zoomMax" v-model.number="zoom"/>
                <input type="number" :min="zoomMin" :max="zoomMax" v-model.number="zoomDisplay" @keyup.enter="zoom = zoomDisplay"/>
                <button v-show="zoom !== 100" @click="resetZoom">Reset</button>
            </label>
        </div>
    </div>
        <div class="image-canvas-supercontainer" v-show="isImageLoaded">
            <div class="image-canvas-container" :class="{'show-original': showOriginalImage}">
                <canvas ref="saveImageCanvas" class="hidden"></canvas><?php //used when saving image, so pixelated images are scaled correctly ?>
                <canvas ref="originalImageCanvas" class="hidden"></canvas><?php //original non-pixelated image loaded by user ?>
                <canvas ref="sourceCanvas" class="hidden"></canvas><?php //pixelated-image used as source to dithers ?>
                <canvas ref="transformCanvas" class="hidden"></canvas><?php //output from dither ?>
                <canvas ref="transformCanvasWebgl" class="hidden"></canvas><?php //output from webgl, copied to above because otherwise chrome will freak out when we change tabs ?>
                <canvas ref="sourceCanvasOutput" class="output-canvas" v-show="showOriginalImage"></canvas><?php //original image as displayed to the user, after zoomed and pixelated ?>
                <canvas ref="transformCanvasOutput" class="output-canvas"></canvas><?php //output from dither as shown to user, after zoom ?>
            </div>
        </div>
    <modal-prompt ref="modalPromptComponent" />
</div>