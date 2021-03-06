const autoprefixer = require('autoprefixer')
const context = require('postcss-plugin-context')
const increaseSpecificity = require('postcss-increase-specificity')
const focusVisible = require('postcss-focus-visible')
const purgecss = require('@fullhuman/postcss-purgecss')

module.exports = {
  plugins: [
    autoprefixer(),
    context({
      app: increaseSpecificity({
        overrideIds: false,
        repeat: 1,
        stackableRoot: '.app'
      })
    }),
    focusVisible(),
    purgecss({
      content: ['_build/**/*.html']
    })
  ]
}
