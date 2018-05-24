<div class="controls-tab-container">
    <fieldset>
        <legend>Device</legend>
        <button class="btn btn-primary" @click="openDeviceImage" title="Open local image file">Image file</button>
    </fieldset>
    <fieldset>
        <legend>Web</legend>
        <button class="btn btn-default" @click="showOpenImageUrlPrompt" :disabled="isCurrentlyLoadingImageUrl" title="Open image from Url">Image url</button>
    <button class="btn btn-default" @click="openRandomImage" :disabled="isCurrentlyLoadingImageUrl" title="Open random image from Unsplash">Random image</button>
    </fieldset>    
</div>