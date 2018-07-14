<div class="alerts-container">
    <div class="alert alert-danger" v-if="showOpenImageErrorMessage &amp;&amp; openImageErrorMessage">
        <div @click="showOpenImageErrorMessage=false" class="alert-close-button"></div>
        <template v-if="typeof openImageErrorMessage === 'object'">
            {{openImageErrorMessage.beforeUrl}} <a :href="openImageErrorMessage.url" class="alert-link">{{openImageErrorMessage.url}}</a> {{openImageErrorMessage.afterUrl}}
        </template>
        <template v-else>
            {{openImageErrorMessage}}
        </template>
    </div>
    <div class="alert alert-warning" v-if="showWebglWarningMessage &amp;&amp; webglWarningMessage">
        <div @click="showWebglWarningMessage=false" class="alert-close-button"></div>
        {{webglWarningMessage}}
    </div>
</div>