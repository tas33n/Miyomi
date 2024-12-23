import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type SatoriOptions, defineSatoriConfig } from 'x-satori/vue'
const __dirname = dirname(fileURLToPath(import.meta.url))
const __fonts = resolve(__dirname, '../fonts')

const fonts: SatoriOptions['fonts'] = [
  {
    name: 'Inter',
    data: await readFile(resolve(__fonts, 'Inter-Regular.otf')),
    weight: 400,
    style: 'normal'
  },
  {
    name: 'Inter',
    data: await readFile(resolve(__fonts, 'Inter-Medium.otf')),
    weight: 500,
    style: 'normal'
  },
  {
    name: 'Inter',
    data: await readFile(resolve(__fonts, 'Inter-SemiBold.otf')),
    weight: 600,
    style: 'normal'
  },
  {
    name: 'Inter',
    data: await readFile(resolve(__fonts, 'Inter-Bold.otf')),
    weight: 700,
    style: 'normal'
  }
]

export default defineSatoriConfig({
  width: 1400,
  height: 750,
  fonts,
  props: {
    title: 'Very Long Title so that I Can See How Shit Looks',
    description:
      'Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.',
    dir: '/j'
  }
})
