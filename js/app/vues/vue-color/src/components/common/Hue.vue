<template>
  <div :class="['vc-hue', directionClass]">
    <div class="vc-hue-container" ref="container"
      @mousedown="handleMouseDown"
      @touchmove="handleChange"
      @touchstart="handleChange">
      <div class="vc-hue-pointer" :style="{top: pointerTop, left: pointerLeft}">
        <div role="huePicker" class="vc-hue-picker"></div>
      </div>  
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: Object,
    direction: {
      type: String,
      // [horizontal | vertical]
      default: 'horizontal'
    }
  },
  data () {
    return {
      oldHue: 0,
      pullDirection: ''
    }
  },
  computed: {
    colors () {
      const h = this.modelValue.hsv.h;
      if (h !== 0 && h - this.oldHue > 0) {
        this.pullDirection = 'right';
      }
      else if (h !== 0 && h - this.oldHue < 0) {
        this.pullDirection = 'left';
      }
      this.oldHue = h;

      return this.modelValue;
    },
    directionClass () {
      return {
        'vc-hue--horizontal': this.direction === 'horizontal',
        'vc-hue--vertical': this.direction === 'vertical'
      };
    },
    pointerTop () {
      if (this.direction === 'vertical') {
        if (this.colors.hsv.h === 0 && this.pullDirection === 'right') {
          return 0;
        }
        return -((this.colors.hsv.h * 100) / 360) + 100 + '%';
      } else {
        return 0;
      }
    },
    pointerLeft () {
      if (this.direction === 'vertical') {
        return 0;
      } else {
        if (this.colors.hsv.h === 0 && this.pullDirection === 'right') {
          return '100%';
        }
        return (this.colors.hsv.h * 100) / 360 + '%';
      }
    }
  },
  methods: {
    handleChange (e, skip) {
      !skip && e.preventDefault()

      const container = this.$refs.container;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const xOffset = container.getBoundingClientRect().left + window.pageXOffset;
      const yOffset = container.getBoundingClientRect().top + window.pageYOffset;
      const pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
      const pageY = e.pageY || (e.touches ? e.touches[0].pageY : 0);
      const left = pageX - xOffset;
      const top = pageY - yOffset;

      let h;
      let percent;

      if (this.direction === 'vertical') {
        if (top < 0) {
          h = 360;
        } else if (top > containerHeight) {
          h = 0;
        } else {
          percent = -(top * 100 / containerHeight) + 100;
          h = (360 * percent / 100);
        }

        if (this.colors.hsv.h !== h) {
          this.$emit('change', {
            h: h,
            s: this.colors.hsv.s,
            v: this.colors.hsv.v,
          });
        }
      } else {
        if (left < 0) {
          h = 0;
        } else if (left > containerWidth) {
          h = 360;
        } else {
          percent = left * 100 / containerWidth;
          h = (360 * percent / 100);
        }

        if (this.colors.hsv.h !== h) {
          this.$emit('change', {
            h: h,
            s: this.colors.hsv.s,
            v: this.colors.hsv.v,
          });
        }
      }
    },
    handleMouseDown (e) {
      this.handleChange(e, true)
      window.addEventListener('mousemove', this.handleChange);
      window.addEventListener('mouseup', this.handleMouseUp);
    },
    handleMouseUp (e) {
      this.unbindEventListeners();
    },
    unbindEventListeners () {
      window.removeEventListener('mousemove', this.handleChange);
      window.removeEventListener('mouseup', this.handleMouseUp);
    }
  }
}
</script>

<style lang="scss">
.vc-hue {
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  border-radius: 2px;
}
.vc-hue--horizontal {
  background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}
.vc-hue--vertical {
  background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}
.vc-hue-container {
  cursor: pointer;
  margin: 0 2px;
  position: relative;
  height: 100%;
}
.vc-hue-pointer {
  z-index: 2;
  position: absolute;
}
.vc-hue-picker {
  cursor: pointer;
  margin-top: 1px;
  width: 4px;
  border-radius: 1px;
  height: 8px;
  box-shadow: 0 0 2px rgba(0, 0, 0, .6);
  background: #fff;
  transform: translateX(-2px) ;
}
</style>
