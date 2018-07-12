<div class="zoom-bar-container">
    <div class="zoom-bar-controls">
        <label for="zoom-bar-range">Zoom</label>
        <input id="zoom-bar-range" type="range" :min="zoomMin" :max="zoomMax" v-model.number="zoom"/>
        <input type="number" :min="zoomMin" :max="zoomMax" v-model.number="zoomDisplay" @keyup.enter="zoom = zoomDisplay"/>
    </div>
    <div class="zoom-bar-button-container">
        <button class="btn btn-default btn-sm zoom-bar-fit-button" @click="zoomFit" title="Fit image on screen">Fit</button>
        <button class="btn btn-default btn-sm" v-show="zoom !== 100" @click="resetZoom" title="Reset zoom to 100%">Full</button>
    </div>
</div>