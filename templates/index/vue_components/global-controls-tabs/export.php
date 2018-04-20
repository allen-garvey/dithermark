<div>
    <label>File name
        <input placeholder="File name" v-model="saveImageFileName" @keyup.enter="saveImage" /><span>{{saveImageFileExtension}}</span>
    </label>
</div>
<div>
    <label class="super-label">File type</label>
    <label>png
        <input type="radio" v-model="saveImageFileType" value="image/png" />
    </label>
    <label>jpeg
        <input type="radio" v-model="saveImageFileType" value="image/jpeg" />
    </label>
</div>
<div>
    <button v-on:click="saveImage" title="Save image to downloads folder">Save image</button>
</div>