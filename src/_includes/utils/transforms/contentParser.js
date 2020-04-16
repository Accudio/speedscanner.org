const jsdom = require('@tbranyen/jsdom')
const { JSDOM } = jsdom
const slugify = require('slugify')

module.exports = function(value, outputPath) {
  if (outputPath && outputPath.endsWith('.html')) {
    /**
     * create the document model
     */
    const DOM = new JSDOM(value)
    const document = DOM.window.document

    /**
     * Get all the images from the post
     */
    const images = [...document.querySelectorAll('main article img')]
    if (images.length) {
      images.forEach(image => {
        /**
         * Set the loading attribute to all
         * the images to be lazy loaded if supported
         */
        image.setAttribute('loading', 'lazy')
      })
    }
    /**
     * Get all the headings inside the post
     */
    const articleHeadings = [
      ...document.querySelectorAll(
        'article h2, article h3, article h4, article h5, article h6'
      )
    ]
    if (articleHeadings.length) {
      /**
       * Create an ahcor element inside each post heading
       * to link to the secion
       */
      articleHeadings.forEach(heading => {
        // Create the anchor slug
        const headingSlug = slugify(heading.textContent.toLowerCase())
        // Set the ID attribute with the slug
        heading.setAttribute('id', `${headingSlug}`)
      })
    }
    /**
     * Get all the iframes inside the article
     * and add loading="lazy"
     */
    const articleEmbeds = [...document.querySelectorAll('iframe')]
    if (articleEmbeds.length) {
      articleEmbeds.forEach(embed => {
        embed.setAttribute('loading', 'lazy')
      })
    }

    /**
     * Get all links with explicit href
     * and add noopener rel value
     */
    const links = [...document.querySelectorAll('a[href]')]
    if (links.length) {
      links.forEach(link => {
        /**
         * For each link found get all the original attributes
         * and apply them to the custom link element
         */
        const externalLink = document.createElement('a')
        if (link.hasAttributes()) {
          const linkAttributes = link.attributes
          for (var i = linkAttributes.length - 1; i >= 0; i--) {
            externalLink.setAttribute(
              linkAttributes[i].name,
              linkAttributes[i].value
            )
          }
        }
        /**
         * If the link starts with http or https
         * appen the "noopener" value to the rel attribute
         */
        const getHref = link.getAttribute('href')
        const currentRel = link.getAttribute('rel')
        const isExternal =
          getHref.startsWith('http') || getHref.startsWith('https')
        if (isExternal) {
          externalLink.setAttribute(
            'rel',
            currentRel && !currentRel.includes('noopener')
              ? `${currentRel} noopener noreferrer`
              : 'noopener noreferrer'
          )
        }
        externalLink.innerHTML = link.innerHTML
        link.replaceWith(externalLink.cloneNode(true))
      })
    }

    return '<!DOCTYPE html>\r\n' + document.documentElement.outerHTML
  }
  return value
}
