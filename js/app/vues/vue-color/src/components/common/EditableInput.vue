<template>
  <div class="vc-editable-input">
    <label class="vc-input__label" :title="title">{{label}}
      <input class="vc-input__input"
      :aria-label="label"
      :type="inputType"
      v-model="displayVal"
      @keydown="handleKeyDown"
      @input="update"
      ref="input">
    </label>
  </div>
</template>

<script>
export default {
  name: 'editableInput',
  props: {
    label: String,
    dataName: String,
    title: String,
    type: String,
    value: [String, Number],
    max: Number,
    min: Number,
    arrowOffset: {
      type: Number,
      default: 1
    }
  },
  computed: {
    val: {
      get () {
        return this.value;
      },
      set (v) {
        if (this.max !== undefined && +v > this.max) {
          this.$refs.input.value = this.max;
        } 
        else if(this.min !== undefined && +v < this.min){
          this.$refs.input.value = this.min;
        }
        else {
          return v;
        }
      }
    },
    displayVal: {
      get () {
        return this.val;
      },
      set (v) {
        this.val = v;
      }
    },
    inputType: function(){
      return this.type;
    }
  },
  methods: {
    update (e) {
      this.handleChange(e.target.value)
    },
    handleChange (newVal) {
      const data = {};
      data[this.dataName] = newVal;
      this.$emit('change', data, this.dataName);
    },
    handleKeyDown (e) {
      let val = this.val;
      const number = Number(val);

      if (number) {
        const amount = this.arrowOffset || 1;

        switch(e.key) {
          case 'ArrowUp':
            val = number + amount;
            this.handleChange(val);
            e.preventDefault();
            break;
          case 'ArrowDown':
            val = number - amount;
            this.handleChange(val);
            e.preventDefault();
            break;
        }
      }
    }
  }
}
</script>
