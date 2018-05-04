<div>
    <button class="btn btn-default btn-sm" v-on:click="saveTexture">Save texture</button>
    <button class="btn btn-default btn-sm" v-show="savedTextures.length >= 3" v-on:click="combineDitherTextures">Combine textures</button>
</div>