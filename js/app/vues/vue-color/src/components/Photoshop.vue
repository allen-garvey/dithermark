<template>
  <div :class="[disableFields ? 'vc-photoshop__disable-fields' : '']">
    <div class="vc-ps-head">{{head}}</div>
    <div class="vc-ps-body">
      <div class="vc-ps-body-main">
        <div class="vc-ps-first-column">
          <div class="vc-ps-saturation-wrap">
            <saturation v-model="colors" @change="childChange"></saturation>
          </div>
          <div class="vc-ps-button-container vc-ps-button-container-main">
            <button class="btn btn-default btn-sm" aria-label="cancel" @click="handleCancel">Cancel</button>
            <button class="btn btn-primary btn-sm" aria-label="confirm" @click="handleAccept">Ok</button>
          </div>
        </div>
        <div class="vc-ps-hue-wrap">
          <hue v-model="colors" @change="childChange" direction="vertical">
            <div class="vc-ps-hue-pointer">
              <i class="vc-ps-hue-pointer--left"></i><i class="vc-ps-hue-pointer--right"></i>
            </div>
          </hue>
        </div>
      </div>
      <div class="vc-ps-controls">
        <div class="vc-ps-previews">
          <div class="vc-ps-previews__label">new</div>
          <div class="vc-ps-previews__swatches">
            <div class="vc-ps-previews__pr-color" :aria-label="'newColor:' + colors.hex" :style="{background: '#'+hex}"></div>
            <div class="vc-ps-previews__pr-color" :aria-label="'currentColor:' + currentColor" :style="{background: currentColor}" @click="clickCurrentColor"></div>
          </div>
          <div class="vc-ps-previews__label">current</div>
        </div>
        <div class="vc-ps-actions" v-if="!disableFields">
          <div class="vc-ps-fields">
            <!-- hsv -->
            <div class="vc-ps-fields-group vc-ps-hsv-fields">
              <ed-in label="h" data-name="h" title="Hue" type="number" :value="hsv.h" @change="inputChange"></ed-in>
              <ed-in label="s" data-name="s" title="Saturation" type="number" :value="hsv.s" :max="100" :min="0" @change="inputChange"></ed-in>
              <ed-in label="v" data-name="v" title="Value" type="number" :value="hsv.v" :max="100" :min="0" @change="inputChange"></ed-in>
            </div>
            <!-- rgb -->
            <div class="vc-ps-fields-group vc-ps-rgb-fields">
              <ed-in label="r" data-name="r" title="Red" type="number" :value="colors.rgb.r" :max="255" :min="0" @change="inputChange"></ed-in>
              <ed-in label="g" data-name="g" title="Green" type="number" :value="colors.rgb.g" :max="255" :min="0" @change="inputChange"></ed-in>
              <ed-in label="b" data-name="b" title="Blue" type="number" :value="colors.rgb.b" :max="255" :min="0" @change="inputChange"></ed-in>
            </div>
            <!-- hex -->
            <div class="vc-ps-fields-group vc-ps-hex-fields">
              <ed-in label="#" data-name="#" title="Color hex representation" type="text" class="vc-ps-fields__hex" :value="hex" @change="inputChange"></ed-in>
            </div>
          </div>
        </div>
      </div>
      <div class="vc-ps-button-container vc-ps-button-container-secondary">
        <button class="btn btn-default btn-sm" aria-label="cancel" @click="handleCancel">Cancel</button>
        <button class="btn btn-primary btn-sm" aria-label="confirm" @click="handleAccept">Ok</button>
      </div>
    </div>
  </div>
</template>

<script>
import colorMixin from '../mixin/color'
import editableInput from './common/EditableInput.vue'
import saturation from './common/Saturation.vue'
import hue from './common/Hue.vue'

//hues greater than 360 are handled automatically
function wrapHue(hue){
  if(hue < 0){
    return 360 + (hue % 360);
  }
  return hue
}

export default {
  mixins: [colorMixin],
  props: {
    head: {
      type: String,
      default: 'Color Picker'
    },
    disableFields: {
      type: Boolean,
      default: false
    },
    shouldLiveUpdate: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'ok', 'cancel'],
  components: {
    saturation,
    hue,
    'ed-in': editableInput
  },
  data () {
    return {
      currentColor: '#FFF'
    }
  },
  computed: {
    hsv () {
      return this.colors.hsv
    },
    hex () {
      const hex = this.colors.hex
      return hex && hex.replace('#', '')
    }
  },
  created () {
    this.currentColor = '#' + this.hex
  },
  methods: {
    childChange (data) {
      this.colorChange(data)
    },
    inputChange (data, dataKey) {
      if (!data) {
        return
      }
      if (dataKey === '#') {
        if(this.isValidHex(data['#'])){
          this.colorChange({
            hex: data['#'],
            dataKey: 'hex',
          })
        }
      } else if (['r', 'g', 'b'].includes(dataKey)) {
        this.colorChange({
          r: 'r' === dataKey ? data.r : this.colors.rgb.r,
          g: 'g' === dataKey ? data.g : this.colors.rgb.g,
          b: 'b' === dataKey ? data.b : this.colors.rgb.b,
          dataKey,
        })
      } else if (['h', 's', 'v'].includes(dataKey)) {
        this.colorChange({
          h: 'h' === dataKey ? wrapHue(data.h) : this.colors.hsv.h,
          s: 's' === dataKey ? data.s : this.colors.hsv.s,
          v: 'v' === dataKey ? data.v : this.colors.hsv.v,
          dataKey,
        })
      }
    },
    clickCurrentColor () {
      this.colorChange({
        hex: this.currentColor,
        dataKey: 'hex',
      })
    },
    handleAccept () {
      this.$emit('ok', '#' + this.hex.toLowerCase())
    },
    handleCancel () {
      this.$emit('cancel', this.currentColor.toLowerCase())
    }
  }

}
</script>

<style lang="scss">
.vc-photoshop__disable-fields {
  width: 390px;
}
.vc-ps-head {
  padding: 6px 0 0;
  font-size: 13px;
  text-align: center;
}
.vc-ps-body {
  padding: 2px 7px 5px 5px;
  display: flex;
}
.vc-ps-body-main{
  display: flex;
}

.vc-ps-saturation-wrap {
  width: 256px;
  height: 256px;
  position: relative;
  border: 2px solid #B3B3B3;
  overflow: hidden;
}
.vc-ps-saturation-wrap .vc-saturation-circle {
  width: 12px;
  height: 12px;
}

.vc-ps-hue-wrap {
  position: relative;
  height: 256px;
  width: 37px;
  margin-left: 10px;
  border: 2px solid #B3B3B3;
}
.vc-ps-hue-pointer {
  position: relative;
}
.vc-ps-hue-pointer--left,
.vc-ps-hue-pointer--right {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 5px 0 5px 8px;
  border-color: transparent transparent transparent #555;
}
.vc-ps-hue-pointer--left:after,
.vc-ps-hue-pointer--right:after {
  content: "";
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px 0 4px 6px;
  border-color: transparent transparent transparent #fff;
  position: absolute;
  top: 1px;
  left: 1px;
  transform: translate(-8px, -5px);
}
.vc-ps-hue-pointer--left {
  transform: translate(-13px, -4px);
}
.vc-ps-hue-pointer--right {
  transform: translate(20px, -4px) rotate(180deg);
}

.vc-ps-controls {
  margin-left: 12px;
}

.vc-ps-previews {
  width: 60px;
}
.vc-ps-previews__swatches {
  border: 1px solid #B3B3B3;
  margin-bottom: 2px;
  margin-top: 1px;
}
.vc-ps-previews__pr-color {
  height: 34px;
  box-shadow: inset 1px 0 0 #000, inset -1px 0 0 #000, inset 0 1px 0 #000;
}
.vc-ps-previews__label {
  font-size: 14px;
  text-align: center;
}
.vc-ps-fields-group{
  margin-bottom: 5px;
}
.vc-ps-fields {
  padding-top: 5px;
}
.vc-ps-button-container{
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
  align-items: center;
}
.vc-ps-first-column{
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
}

/*
* Media queries so the color picker doesn't stretch small screens
*/

$color_picker_full_version_min_width: 465px;

@media screen and (min-width: $color_picker_full_version_min_width) {
    .vc-ps-button-container-secondary {
        display: none;
    }
}

//disable things for mobile
@media screen and (max-width: $color_picker_full_version_min_width - 1px) {
    .vc-ps-body {
        display: block;
    }

    .vc-ps-button-container-main,
    .vc-ps-previews,
    .vc-ps-hsv-fields,
    .vc-ps-rgb-fields {
        display: none;
    }

    .vc-ps-controls {
        margin-left: 0;
    }

    .vc-ps-fields__hex {
        display: flex;
        justify-content: center;
    }

    .vc-ps-button-container-secondary {
        margin-bottom: 5px;
    }
}
</style>
