import ColorMath from '../color-math.js'

function _colorChange (data) {
  const color = ColorMath.createColor(data)
  const hsv = color.hsv

  // make sure hue isn't changed if we didn't change it (should only happen when s or v is 0)
  if (typeof data === 'object' && data.dataKey !== 'h' && 'h' in data && data.h !== hsv.h) {
    hsv.h = data.h
  }

  return {
    hex: color.hex.toUpperCase(),
    rgb: roundObjectValues(color.rgb),
    hsv: roundObjectValues(hsv),
  }
}

function roundObjectValues(object){
  const ret = {}

  for(let key in object){
    ret[key] = Math.round(object[key])
  }

  return ret
}

export default {
  props: ['modelValue'],
  data () {
    return {
      val: _colorChange(this.modelValue)
    }
  },
  computed: {
    colors: {
      get () {
        return this.val
      },
      set (newVal) {
        this.val = newVal
        if (this.shouldLiveUpdate) {
          this.$emit('update:modelValue', '#' + newVal.hex.toLowerCase())
        }
      }
    }
  },
  methods: {
    colorChange (data) {
      this.colors = _colorChange(data)
    },
    isValidHex (hex) {
      return ColorMath.isHexStringValid(hex)
    }
  }
}
