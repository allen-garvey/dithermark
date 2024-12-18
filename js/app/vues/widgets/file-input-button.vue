<template>
    <div>
        <button 
            class="btn" 
            :class="buttonClass"
            @click="triggerFileInput" 
            :title="tooltip"
            :tabindex="tabindex"
        >
            {{ label }}
        </button>
        <input 
            type="file"
            @change.prevent="onFileInputChange($event)"
            ref="fileInput" 
            v-show="false" 
            :multiple="multiple"
        />
    </div>
</template>

<style lang="scss" module>
</style>

<script>
export default {
    props: {
        buttonClass: {
            type: String,
            default: 'btn-default',
        },
        label: {
            type: String,
            required: true,
        },
        tooltip: {
            type: String,
            required: true,
        },
        multiple: {
            type: Boolean,
            default: false,
        },
        onFilesChanged: {
            type: Function,
            required: true,
        },
        tabindex: {
            type: Number,
            default: 0,
        },
    },
    methods: {
        triggerFileInput(){
            this.$refs.fileInput.click();
        },
        onFileInputChange($event){
            const fileInput = $event.target;
            this.onFilesChanged(fileInput.files);
            fileInput.value = '';
        },
    }
};
</script>