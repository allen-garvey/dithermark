<div v-if="isFullScreenModeSupported">
    <button class="btn btn-default btn-sm" @click="toggleFullScreenMode">{{isFullScreen ? 'Exit fullscreen' : 'Fullscreen mode'}}</button>
</div>