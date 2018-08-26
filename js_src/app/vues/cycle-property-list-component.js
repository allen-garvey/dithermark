export default {
    name: 'cycle-property-list', 
    template: document.getElementById('cycle-property-list-component'),
    props: {
        value: [Number],
        modelName: [String],
        arrayLength: [Number],
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
            let newValue = this.value - 1;
            if(newValue < this.arrayStartIndex){
                newValue = this.arrayLength - 1;
            }
            this.$emit('input', newValue);
        },
        nextButtonClicked(){
            let newValue = this.value + 1;
            if(newValue >= this.arrayLength){
                newValue = this.arrayStartIndex;
            }
            this.$emit('input', newValue);
        },
    },
};