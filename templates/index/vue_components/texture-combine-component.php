<div>
    <button class="btn btn-default btn-sm" @click="saveTexture">Save texture</button>
    <button class="btn btn-default btn-sm" v-show="savedTextures.length >= 3" @click="combineDitherTextures">Combine textures</button>
</div>