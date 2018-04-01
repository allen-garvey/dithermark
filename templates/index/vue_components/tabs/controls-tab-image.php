<div class="spread-content">
    <label>Show source image
        <input type="checkbox" v-model="showOriginalImage"/>
    </label>
</div>
<div>
    <label>Pixelate image
        <select v-model.number="pixelateImageZoom">
            <option value="100">None</option>
            <option value="50">Medium</option>
            <option value="25">High</option>
            <option value="15">Ultra</option>
        </select>
    </label>
</div>
<div>
    <label>
        Zoom
        <input type="range" v-bind:min="zoomMin" v-bind:max="zoomMax" v-model.number="zoom"/>
        <input type="number" v-bind:min="zoomMin" v-bind:max="zoomMax" v-model.number="zoom"/>
        <button v-show="zoom !== 100" v-on:click="resetZoom">Reset</button>
    </label>
</div>