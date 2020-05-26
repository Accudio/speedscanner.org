const normalize = require('postcss-normalize')
const autoprefixer = require('autoprefixer')
const context = require('postcss-plugin-context')
const increaseSpecificity = require('postcss-increase-specificity')
const focusVisible = require('postcss-focus-visible')

module.exports = {
  plugins: [
    normalize(),
    autoprefixer(),
    context({
      app: increaseSpecificity({
        overrideIds: false,
        repeat: 1,
        stackableRoot: '.app'
      })
    }),
    focusVisible()
  ]
}
