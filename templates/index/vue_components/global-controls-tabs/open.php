<div>
    <button class="btn btn-primary" v-on:click="loadImageTrigger" title="Open local image file">Open image</button>
    <button class="btn btn-default" v-on:click="showOpenImageUrlPrompt" v-bind:disabled="isCurrentlyLoadingImageUrl" title="Load image from Url">Open image url</button>
    <button class="btn btn-default" v-on:click="loadRandomImage" v-bind:disabled="isCurrentlyLoadingImageUrl" title="Load random image from Unsplash">Random image</button>    
</div>