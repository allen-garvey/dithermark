<div>
    <div class="controls" v-cloak>
        <div class="controls-toplevel-container">
            <div>
                <button v-on:click="loadImageTrigger" title="Open local image file">Open image</button>
                <button v-on:click="loadRandomImage" v-bind:disabled="isCurrentlyLoadingRandomImage" title="Load random image from Unsplash">Random image</button>    
            </div>
            <div>
                <button v-on:click="saveImage" v-show="isImageLoaded">Save image</button>
            </div>
        </div>
        <div class="image-title-container">
            <h3 class="image-title">{{imageTitle}}</h3>
        </div>
        <div class="controls-secondlevel-container" v-show="isImageLoaded">
            <div class="controls-panel">
                <div class="spread-content">
                    <label class="super-label">Editor Theme</label>
                    <template v-for="(theme, index) in editorThemes">
                        <label>{{theme.name}}
                            <input type="radio" v-model="currentEditorThemeIndex" v-bind:value="index" />
                        </label>
                    </template>
                </div>
                <div class="spread-content">
                    <label>Show source image
                        <input type="checkbox" v-model="showOriginalImage"/>
                    </label>
                </div>
                
                <div class="spread-content">
                    <label>Live preview
                        <input type="checkbox" v-model="isLivePreviewEnabled"/>
                    </label>
                    
                    <label v-if="isWebglSupported">Enable WebGL
                        <input type="checkbox" v-model="isWebglEnabled"/>
                    </label>

                    <label>Pin controls
                        <input type="checkbox" v-model="areControlsPinned"/>
                    </label>
                </div>
                <div>
                    <label>
                        Zoom
                        <input type="number" v-bind:min="zoomMin" v-bind:max="zoomMax" v-model="zoom"/>
                        <input type="range" v-bind:min="zoomMin" v-bind:max="zoomMax" v-model="zoom"/>
                        <button v-show="zoom !== 100" v-on:click="resetZoom">Reset</button>
                    </label>
                </div>
            </div>
            <div class="super-dither-controls-container">
                <div class="tabs-container">
                    <div class="tab" v-bind:class="{active: activeTab === 0}" v-on:click="loadTab(0)">BW Dither</div>
                    <div class="tab" v-bind:class="{active: activeTab === 1}" v-on:click="loadTab(1)">Color Dither</div>
                </div>
                <div v-show="activeTab === 0">
                    <bw-dither-section ref="bwDitherSection" v-on:request-worker="onWorkerRequested" v-on:display-transformed-image="zoomImage" v-bind:transform-canvas-web-gl="transformCanvasWebGl" v-bind:transform-canvas="transformCanvas" v-bind:source-canvas="sourceCanvas" v-bind:is-webgl-enabled="isWebglEnabled" v-bind:is-webgl-supported="isWebglSupported" v-bind:is-live-preview-enabled="isLivePreviewEnabled" />  
                </div>
                <div v-show="activeTab === 1">
                    <color-dither-section ref="colorDitherSection" v-on:request-worker="onWorkerRequested" v-on:display-transformed-image="zoomImage" v-bind:transform-canvas-web-gl="transformCanvasWebGl" v-bind:transform-canvas="transformCanvas" v-bind:source-canvas="sourceCanvas" v-bind:is-webgl-enabled="isWebglEnabled" v-bind:is-webgl-supported="isWebglSupported" v-bind:is-live-preview-enabled="isLivePreviewEnabled" />
                </div>
            </div>
        </div>
    </div>
    <div class="image-canvas-container" v-bind:class="{'show-original': showOriginalImage}">
        <canvas ref="sourceCanvas" class="hidden"></canvas>
        <canvas ref="transformCanvas" class="hidden"></canvas>
        <canvas ref="transformCanvasWebgl" class="hidden"></canvas>
        <canvas ref="sourceCanvasOutput" class="output-canvas" v-show="showOriginalImage"></canvas>
        <canvas ref="transformCanvasOutput" class="output-canvas"></canvas>
    </div>
</div>