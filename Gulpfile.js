'use strict'

// packages/modules
const fs = require('fs')
const gulp = require('gulp')
const path = require('path')
const watch = require('gulp-watch')
const plumber = require('gulp-plumber')
const async = require('async')

const sourcemaps = require('gulp-sourcemaps')
const purgeSourcemaps = require('gulp-purge-sourcemaps')
const concat = require('gulp-concat')

const sass = require('gulp-sass')
const sassGlob = require('gulp-sass-glob')
const postcss = require('gulp-postcss')
const context = require('postcss-plugin-context')
const clean = require('postcss-clean')
const postcssNormalize = require('postcss-normalize')
const autoprefixer = require('autoprefixer')
const increaseSpecificity = require('postcss-increase-specificity')
const postcssFocusVisible = require('postcss-focus-visible')

const imagemin = require('gulp-imagemin')

const colors = require('ansi-colors')
const log = require('fancy-log')
const argv = require('yargs').argv

const stylelint = require('gulp-stylelint')

const svgstore = require('gulp-svgstore')
const svgmin = require('gulp-svgmin')
const rename = require('gulp-rename')

// gulp options
const options = {
  styles: {
    build: '_build/css/',
    bundles: {
      // use to override default options for file-system generation or add external bundles
      main: {
        styles: [
          'css/main/style.scss'
        ],
        postcss: [
          postcssNormalize(),
          autoprefixer(),
          context({
            app: increaseSpecificity({
              overrideIds: false,
              repeat: 1,
              stackableRoot: '.app'
            })
          }),
          postcssFocusVisible()
        ],
        lint: 'css/main/**/*.scss',
        sass: true,
        sourcemap: true
      }
    },
    watch: 'css/**/*.scss'
  },
  icons: {
    src: 'icons/',
    out: '_build',
    prefix: 'icons-',
    watch: 'icons/*.svg'
  },
  images: {
    src: 'img/',
    dist: '_build/img/',
    formats: ['png', 'gif', 'jpg', 'jpeg', 'svg'],
    options: [
      imagemin.gifsicle({
        optimizationLevel: 2,
        interlaced: true
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.svgo()
    ]
  },
  maps: {
    build: 'sourcemaps/'
  }
}

// bundle-based style compilation with generation from filesystem structure
gulp.task('compile:styles', (done) => {
  let tasks = []

  let bundles = {}
  fs.readdir('css', (err, files) => {
    if (err) {
      handleError(err, 'Error reading filesystem')
      return
    }

    files.filter(name => !name.startsWith('_')).forEach(function(name) {
      bundles[name] = options.styles.bundles[name] || {
        styles: [
          'css/' + name + '/style.scss'
        ],
        postcss: [
          autoprefixer(),
          context({
            app: increaseSpecificity({
              overrideIds: false,
              repeat: 1,
              stackableRoot: '.app'
            })
          }),
          postcssFocusVisible()
        ],
        lint: 'css/' + name + '/**/*.scss',
        sass: true,
        sourcemap: true
      }
    })

    const bundleNames = Object.keys(bundles)
    bundleNames.forEach(function(bundleName) {
      tasks.push(function() {
        return function(callback) {
          let entrypoint = bundles[bundleName].styles

          // define stream location and set up error handling
          let stream = gulp.src(entrypoint)
            .pipe(plumber(function(error) {
              handleError(error, 'Error compiling styles:')
              this.emit('end')
            }))

          let postcssPlugins = bundles[bundleName].postcss

          // if argument production enabled, add postcss-clean to postcss plugins
          if (argv.production && postcssPlugins) {
            postcssPlugins = Array.isArray(postcssPlugins) ? postcssPlugins : []
            postcssPlugins.push(clean())
          }

          // if not production and sourcemaps enabled initialise, else purge sourcemaps
          if (!argv.production && bundles[bundleName].sourcemap) {
            stream = stream.pipe(sourcemaps.init())
          } else {
            stream = stream.pipe(sourcemaps.init({ loadMaps: true }))
            stream = stream.pipe(purgeSourcemaps())
          }

          // if argument lint enabled, init stylelint
          if (argv.lint && bundles[bundleName].lint) {
            gulp.src(bundles[bundleName].lint).pipe(plumber(function(error) {
              handleError(error, 'Error compiling styles:')
              this.emit('end')
            })).pipe(stylelint({
              reporters: [
                { formatter: 'string', console: true }
              ],
              failAfterError: false
            }))
          }

          // sass
          if (bundles[bundleName].sass) {
            stream = stream
              .pipe(sassGlob())
              .pipe(sass({
                outputStyle: 'expanded'
              }))
          }

          // concatenate
          stream = stream.pipe(concat(bundleName + '.css'))

          // postcss
          if (bundles[bundleName].postcss) {
            stream = stream.pipe(postcss(postcssPlugins))
          }

          // if not production, write sourcemap
          if (!argv.production && bundles[bundleName].sourcemap) {
            stream = stream.pipe(sourcemaps.write('../../' + options.maps.build))
          }

          stream.pipe(gulp.dest(options.styles.build)).on('end', callback)
        }
      }())
    })

    async.parallel(tasks, done)
  })
})

// icon set generation
gulp.task('compile:icons', () => {
  return gulp
    .src(options.icons.src + '*.svg')
    .pipe(svgmin(function(file) {
      var prefix = options.icons.prefix + path.basename(file.relative, path.extname(file.relative))
      return {
        plugins: [
          ...svgoWhitelist(['cleanupIDs']),
          {
            cleanupIDs: {
              prefix: prefix + '-',
              minify: true
            }
          }]
      }
    }))
    .pipe(svgstore())
    .pipe(svgmin(function() {
      return {
        plugins: svgoWhitelist(['removeDoctype', 'removeXMLProcInst'])
      }
    }))
    .pipe(rename({ basename: 'icons' }))
    .pipe(gulp.dest(options.icons.out))
})

// optimise images
gulp.task('optimise:images', () => {
  let paths = options.images.formats.map(format => {
    return options.images.src + '**/*.' + format
  })

  // define stream location and set up error handling
  let stream = gulp.src(paths)
    .pipe(plumber(function(error) {
      handleError(error, 'Error optimising images:')
      this.emit('end')
    }))

  // optimise images, saving at src
  stream = stream.pipe(imagemin(options.images.options, { verbose: true }))

  return stream.pipe(gulp.dest(options.images.dist))
})

// watch styles and compile on change
gulp.task('watch:styles', () => watch(options.styles.watch, gulp.series('compile:styles')))

// watch icons and compile on change
gulp.task('watch:icons', () => watch(options.icons.watch, gulp.series('compile:icons')))

// group tasks
gulp.task('compile', gulp.parallel('compile:styles', 'compile:icons', 'optimise:images'))
gulp.task('watch', gulp.parallel('watch:styles', 'watch:icons'))
gulp.task('default', gulp.series('compile'))

// error handling
function handleError(error, title) {
  log.error(colors.bold.red(title))
  console.log(colors.red(error.message))
}

function svgoWhitelist(enabled) {
  const allPlugins = ['cleanupAttrs', 'inlineStyles', 'removeDoctype', 'removeXMLProcInst', 'removeComments', 'removeMetadata', 'removeTitle', 'removeDesc', 'removeUselessDefs', 'removeXMLNS', 'removeEditorsNSData', 'removeEmptyAttrs', 'removeHiddenElems', 'removeEmptyText', 'removeEmptyContainers', 'removeViewBox', 'cleanupEnableBackground', 'minifyStyles', 'convertStyleToAttrs', 'convertColors', 'convertPathData', 'convertTransform', 'removeUnknownsAndDefaults', 'removeNonInheritableGroupAttrs', 'removeUselessStrokeAndFill', 'removeUnusedNS', 'prefixIds', 'cleanupIDs', 'cleanupNumericValues', 'cleanupListOfValues', 'moveElemsAttrsToGroup', 'moveGroupAttrsToElems', 'collapseGroups', 'removeRasterImages', 'mergePaths', 'convertShapeToPath', 'convertEllipseToCircle', 'sortAttrs', 'sortDefsChildren', 'removeDimensions', 'removeAttrs', 'removeAttributesBySelector', 'removeElementsByAttr', 'addClassesToSVGElement', 'addAttributesToSVGElement', 'removeOffCanvasPaths', 'removeStyleElement', 'removeScriptElement', 'reusePaths']
  const disabled = allPlugins.filter(function(val) {
    return enabled.indexOf(val) === -1
  })
  let plugins = []
  disabled.forEach(function(plugin) {
    let tmpPlugin = {}
    tmpPlugin[plugin] = false
    plugins.push(tmpPlugin)
  })
  return plugins
}
