import resolve from '@rollup/plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

function es6(bundle) {
  const es6Bundle = JSON.parse(JSON.stringify(bundle))
  es6Bundle.plugins = [
    babel({
      presets: [
        [
          '@babel/env',
          {
            modules: false,
            targets: {
              chrome: '60',
              safari: '10.1',
              ios: '10.3',
              firefox: '54',
              edge: '15'
            }
          }
        ]
      ]
    }),
    ...bundle.plugins
  ]
  return es6Bundle
}

function es5(bundle) {
  const es5Bundle = JSON.parse(JSON.stringify(bundle))
  es5Bundle.output.file = bundle.output.file.replace('.js', '-es5.js')
  es5Bundle.plugins = [
    babel({
      presets: [
        [
          '@babel/env',
          { modules: false }
        ]
      ]
    }),
    ...bundle.plugins
  ]
  return es5Bundle
}

const bundles = [
  {
    input: 'js/main.js',
    output: {
      file: '_build/js/main.js',
      format: 'iife',
      name: 'main'
    },
    watch: {
      clearScreen: false,
      exclude: 'node_modules/**'
    },
    plugins: [
      resolve(),
      commonjs(),
      process.env.PRODUCTION ? terser() : null
    ]
  }
]

export default function() {
  const bundleOut = []
  bundles.forEach(function(bundle) {
    bundleOut.push(es6(bundle), es5(bundle))
  })
  return bundleOut
}
