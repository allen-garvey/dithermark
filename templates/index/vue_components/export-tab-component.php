<div class="controls-tab-container">
    <?php //for some reason, using v-if here breaks saveImageFileType ?>
    <div v-show="shouldShowFileName">
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
        <button class="btn btn-success" @click="saveImage" :disabled="isCurrentlySavingImage" title="Save image to downloads folder">Save</button>
    </div>
    <div v-if="!shouldShowFileName" class="hint">
        Image will open in a new tab. Right click / long press on the image to save
    </div>
</div>