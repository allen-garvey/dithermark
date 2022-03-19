<template>
    <div :class="$style.thresholdInputContainer">
        <label for="threshold_input">Threshold</label>
        <input 
            type="range" 
            :min="thresholdMin" 
            :max="thresholdMax" 
            :value="threshold"
            @input="updateThreshold($event.target.value)" 
            list="threshold-tickmarks"
            id="threshold_input"
        />
        <input 
            type="number" 
            :min="thresholdMin" 
            :max="thresholdMax" 
            :value="threshold"
            @input="updateThreshold($event.target.value)"
        />
        <datalist id="threshold-tickmarks">
            <option value="0"/>
            <option value="63"/>
            <option value="127"/>
            <option value="191"/>
            <option value="255"/>
        </datalist>
    </div>
</template>

<style lang="scss" module>


.thresholdInputContainer {
    display: flex;
    flex-wrap: wrap;
    & > *{
        margin-right: 1em;
        align-self: center;
    }
    
    input[type="range"] {
        width: 200px;
    }
}

</style>

<script>
export default {
    props: {
        modelValue: {
            type: Number,
            required: true,
        },
    },
    data(){
        return {
        };
    },
    computed: {
        thresholdMin(){
            return 0;
        },
        thresholdMax(){
            return 255;
        },
        threshold(){
            return this.modelValue;
        },
    },
    methods: {
        updateThreshold(newValue){
            let value = Math.floor(parseInt(newValue));
            
            if(isNaN(value)){
                return;
            }
            if(value < this.thresholdMin){
                value = this.thresholdMin;
            }
            else if(value > this.thresholdMax){
                value = this.thresholdMax;
            }
            if(this.threshold === value){
                return;
            }

            this.$emit('update:modelValue', value);
        },
    }
};
</script>