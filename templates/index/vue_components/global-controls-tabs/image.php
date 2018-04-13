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