interface SliderRange {
  min: number
  max: number
  value: number
}

class SliderInterpreter {
  ranges: SliderRange[]

  constructor(ranges: SliderRange[]) {
    this.ranges = ranges
  }

  interpretValue(sliderValue: number): number {
    const range = this.ranges.find(
      range => sliderValue >= range.min && sliderValue <= range.max
    )
    return range ? range.value : this.ranges[0].value
  }

  getReverseValue(targetValue: number): number {
    const range = this.ranges.find(
      range => range.value === targetValue
    )
    return range ? Math.floor((range.min + range.max) / 2) : this.ranges[0].min
  }

  getAllPossibleValues(): number[] {
    return this.ranges.map(range => range.value)
  }

  findClosestValue(targetValue: number): number {
    const values = this.getAllPossibleValues()
    return values.reduce((prev, curr) => 
      Math.abs(curr - targetValue) < Math.abs(prev - targetValue) ? curr : prev
    )
  }

  getMinSliderValue(): number {
    return this.ranges[0].min
  }

  getMaxSliderValue(): number {
    return this.ranges[this.ranges.length - 1].max
  }
}

// Interpretador para conversas
export const conversationsInterpreter = new SliderInterpreter([
  { min: 0, max: 25, value: 1 },
  { min: 26, max: 50, value: 2 },
  { min: 51, max: 75, value: 3 },
  { min: 76, max: 100, value: 4 },
  { min: 101, max: 125, value: 5 },
  { min: 126, max: 150, value: 10 },
  { min: 151, max: 175, value: 15 },
  { min: 176, max: 200, value: 20 },
  { min: 201, max: 225, value: 30 },
  { min: 226, max: 250, value: 40 },
  { min: 251, max: 275, value: 50 },
  { min: 276, max: 300, value: 100 },
  { min: 301, max: 325, value: 150 },
  { min: 326, max: 350, value: 200 },
  { min: 351, max: 375, value: 300 },
  { min: 376, max: 400, value: 400 },
  { min: 401, max: 425, value: 500 },
  { min: 426, max: 450, value: 600 },
  { min: 451, max: 475, value: 750 },
  { min: 476, max: 500, value: 1000 }
])

// Interpretador para tokens (valores em milhares)
export const tokensInterpreter = new SliderInterpreter([
  { min: 0, max: 25, value: 1 },    // 1k
  { min: 26, max: 50, value: 2 },   // 2k
  { min: 51, max: 75, value: 4 },   // 4k
  { min: 76, max: 100, value: 8 },  // 8k
  { min: 101, max: 125, value: 16 }, // 16k
  { min: 126, max: 150, value: 32 }, // 32k
  { min: 151, max: 175, value: 48 }, // 48k
  { min: 176, max: 200, value: 64 }, // 64k
  { min: 201, max: 225, value: 96 }, // 96k
  { min: 226, max: 250, value: 128 }, // 128k
  { min: 251, max: 275, value: 160 }, // 160k
  { min: 276, max: 300, value: 192 }, // 192k
  { min: 301, max: 325, value: 224 }, // 224k
  { min: 326, max: 350, value: 256 }  // 256k
]) 