const htmlMinTransform = require('./src/_includes/utils/transforms/htmlmin.js')
const contentParser = require('./src/_includes/utils/transforms/contentParser.js')
const htmlDate = require('./src/_includes/utils/filters/htmlDate.js')
// const pwaPlugin = require('eleventy-plugin-pwa')
const errorOverlay = require('eleventy-plugin-error-overlay')
const navigationPlugin = require('@11ty/eleventy-navigation')
const date = require('./src/_includes/utils/filters/date.js')
const fs = require('fs')

/**
 * Import site configuration
 */
const siteConfig = require('./src/_data/config.json')

module.exports = function(eleventyConfig) {
  /**
   * Add custom watch targets
   */
  eleventyConfig.addWatchTarget('css/')
  eleventyConfig.addWatchTarget('js/')

  /**
   * Passthrough file copy
   */
  eleventyConfig.addPassthroughCopy({ 'static': '.' })

  if (process.env.ELEVENTY_ENV === 'development') {
    eleventyConfig.addPassthroughCopy('sourcemaps')
  }

  /**
   * Add filters
   */
  // human friendly date format
  eleventyConfig.addFilter('dateFilter', date)
  // robot friendly date format for crawlers
  eleventyConfig.addFilter('htmlDate', htmlDate)

  /**
   * Add Transforms
   */
  if (process.env.ELEVENTY_ENV === 'production') {
    // minify HTML when building for production
    eleventyConfig.addTransform('htmlmin', htmlMinTransform)
  }
  // parse the page HTML content and perform some manipulation
  eleventyConfig.addTransform('contentParser', contentParser)

  /**
   * Add Plugins
   */
  eleventyConfig.addPlugin(errorOverlay)
  eleventyConfig.addPlugin(navigationPlugin);
  // eleventyConfig.addPlugin(pwaPlugin)

  /**
   * Customise markdown
   */
  const markdownIt = require('markdown-it')
  const markdownItImsize = require('markdown-it-imsize')
  const markdownItLazy = require('markdown-it-image-lazy-loading');
  const markdownLib = markdownIt({ html: true }).use(markdownItImsize).use(markdownItLazy)
  eleventyConfig.setLibrary('md', markdownLib)

  /**
   * Override BrowserSync Server options
   */
  eleventyConfig.setBrowserSyncConfig({
    ...eleventyConfig.browserSyncConfig,
    notify: false,
    open: false,
    snippetOptions: {
      rule: {
        match: /<\/head>/i,
        fn: function(snippet, match) {
          return snippet + match
        },
      },
    },
    // Set local server 404 fallback
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync(`${siteConfig.paths.output}/404.html`)

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404)
          res.end()
        })
      },
    },
  })

  /**
   * Eleventy configuration object
   */
  return {
    dir: {
      input: siteConfig.paths.src,
      includes: siteConfig.paths.includes,
      layouts: `${siteConfig.paths.includes}/layouts`,
      output: siteConfig.paths.output,
    },
    passthroughFileCopy: true,
    templateFormats: ['njk', 'md'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  }
}
