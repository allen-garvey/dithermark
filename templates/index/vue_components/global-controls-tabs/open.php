<div>
    <button v-on:click="loadImageTrigger" title="Open local image file">Open image</button>
    <button v-on:click="loadImageUrl" v-bind:disabled="isCurrentlyLoadingRandomImage" title="Load image from Url">Open image url</button>
    <button v-on:click="loadRandomImage" v-bind:disabled="isCurrentlyLoadingRandomImage" title="Load random image from Unsplash">Random image</button>    
</div>