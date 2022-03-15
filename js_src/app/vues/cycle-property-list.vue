<template>
    <div class="btn-group" role="group">
        <button 
            class="btn btn-default btn-xs" 
            :class="$style.cyclePropertyButton"
            :title="previousButtonTitle" 
            @click="previousButtonClicked"
        >
            &lt;
        </button>
        <button 
            class="btn btn-default btn-xs" 
            :class="$style.cyclePropertyButton"
            :title="nextButtonTitle" 
            @click="nextButtonClicked"
        >
            &gt;
        </button>
    </div>
</template>

<style lang="scss" module>

.cyclePropertyButton{
    min-width: 60px;
    height: 28px;
}

</style>

<script>
export default {
    props: {
        modelValue: {
            type: Number, 
            // required: true //when app first starts, will be null for some values
        },
        modelName: {
            type: String, 
            required: true
        },
        arrayLength: {
            type: Number, 
            required: true
        },
        arrayStartIndex: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        previousButtonTitle(){
            return `Previous ${this.modelName}`;
        },
        nextButtonTitle(){
            return `Next ${this.modelName}`;
        },
    },
    methods: {
        previousButtonClicked(){
            let newValue = this.modelValue - 1;
            if(newValue < this.arrayStartIndex){
                newValue = this.arrayLength - 1;
            }
            this.$emit('update:modelValue', newValue);
        },
        nextButtonClicked(){
            let newValue = this.modelValue + 1;
            if(newValue >= this.arrayLength){
                newValue = this.arrayStartIndex;
            }
            this.$emit('update:modelValue', newValue);
        },
    },
};
</script>