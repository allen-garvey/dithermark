<div class="app-container">
    <div class="alerts-container">
        <div class="alert alert-danger" v-if="openImageErrorMessage">
            <div @click="openImageErrorMessage=null" class="alert-close-button"></div>
            <template v-if="typeof openImageErrorMessage === 'object'">
                {{openImageErrorMessage.beforeUrl}} <a :href="openImageErrorMessage.url" class="alert-link">{{openImageErrorMessage.url}}</a> {{openImageErrorMessage.afterUrl}}
            </template>
            <template v-else>
                {{openImageErrorMessage}}
            </template>
        </div>
        <div class="alert alert-warning" v-if="showWebglWarningMessage &amp;&amp; webglWarningMessage">
            <div @click="showWebglWarningMessage=false" class="alert-close-button"></div>
            {{webglWarningMessage}}
        </div>
    </div>
    <div class="hint-container" v-if="!isImageLoaded">Open an image to begin</div>
    <div class="controls">
        <div ref="controlsContainer" class="controls-container">
            <div :class="{'no-image': !isImageLoaded}" class="global-controls-panel controls-panel">
                <div class="tabs-container">
                    <template v-for="(tab, index) in globalControlsTabs">
                        <div class="tab" :class="{active: activeControlsTab === index, disabled: tab.isDisabled}" @click="setActiveControlsTab(index, tab.isDisabled)">{{tab.name}}</div>
                    </template>
                </div>
                <?php foreach(['open', 'image', 'settings', 'export'] as $index => $templateName): ?>
                    <div v-show="activeControlsTab === <?= $index; ?>">
                        <?php require(TEMPLATES_GLOBAL_CONTROLS_TABS_PATH.$templateName.'.php'); ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <div class="super-dither-controls-container" v-show="isImageLoaded">
                <div class="tabs-container">
                    <div class="tab" :class="{active: activeDitherComponentId === bwDitherComponentId}" @click="loadDitherTab(bwDitherComponentId)">BW Dither</div>
                    <div class="tab" :class="{active: activeDitherComponentId === colorDitherComponentId}" @click="loadDitherTab(colorDitherComponentId)">Color Dither</div>
                </div>
                <div v-show="activeDitherComponentId === bwDitherComponentId">
                    <bw-dither-section ref="bwDitherSection" @request-worker="onWorkerRequested" :request-canvases="requestPermissionCallbackBuilder(bwDitherComponentId, onCanvasesRequested)" :request-display-transformed-image="requestPermissionCallbackBuilder(bwDitherComponentId, onRequestDisplayTransformedImage)" :is-webgl-enabled="isWebglEnabled" :is-live-preview-enabled="isLivePreviewEnabled" :dither-algorithms="bwDitherAlgorithms" />  
                </div>
                <div v-show="activeDitherComponentId === colorDitherComponentId">
                    <color-dither-section ref="colorDitherSection" @request-worker="onWorkerRequested" :request-canvases="requestPermissionCallbackBuilder(colorDitherComponentId, onCanvasesRequested)" :request-display-transformed-image="requestPermissionCallbackBuilder(colorDitherComponentId, onRequestDisplayTransformedImage)" :is-webgl-enabled="isWebglEnabled" :is-live-preview-enabled="isLivePreviewEnabled" @request-modal-prompt="showModalPrompt" :dither-algorithms="colorDitherAlgorithms" />
                </div>
            </div>
        </div>
        <div ref="zoomBarContainer" class="zoom-bar-container" v-show="isImageLoaded">
            <label>
                Zoom
                <input type="range" :min="zoomMin" :max="zoomMax" v-model.number="zoom"/>
                <input type="number" :min="zoomMin" :max="zoomMax" v-model.number="zoomDisplay" @keyup.enter="zoom = zoomDisplay"/>
            </label>
            <div>
                <button class="btn btn-default btn-sm zoom-bar-fit-button" @click="zoomFit" title="Fit image on screen">Fit</button>
                <button class="btn btn-default btn-sm" v-show="zoom !== 100" @click="resetZoom" title="Reset zoom to 100%">Reset</button>
            </div>
        </div>
    </div>
    <?php //if unsplash-attribution component is not in extra div, it breaks dithering for some reason ?>
    <div ref="unsplashAttributionContainer">
        <unsplash-attribution v-if="loadedImage &amp;&amp; loadedImage.unsplash" :unsplash-info="loadedImage.unsplash" />
    </div>
    <div class="image-canvas-supercontainer" v-show="isImageLoaded">
        <div class="image-canvas-container" :class="{'show-original': showOriginalImage}">
        <?php //<canvas ref="saveImageCanvas" class="hidden"></canvas> //used when saving image, so pixelated images are scaled correctly ?>
        <?php //   <canvas ref="originalImageCanvas" class="hidden"></canvas>//original non-pixelated image loaded by user ?>
        <?php //    <canvas ref="sourceCanvas" class="hidden"></canvas>< //pixelated-image used as source to dithers ?>
        <?php //    <canvas ref="transformCanvas" class="hidden"></canvas> //output from dither ?>
        <?php //    <canvas ref="transformCanvasWebgl" class="hidden"></canvas> //output from webgl, copied to above because otherwise chrome will freak out when we change tabs ?>
        <?php //ditherOutputCanvas saves output from dither, before post dither filters ?>   
            <canvas ref="sourceCanvasOutput" class="output-canvas" v-show="showOriginalImage"></canvas><?php //original image as displayed to the user, after zoomed and pixelated ?>
            <canvas ref="transformCanvasOutput" class="output-canvas"></canvas><?php //output from dither as shown to user, after zoom ?>
        </div>
    </div>
    <modal-prompt ref="modalPromptComponent" />
</div>