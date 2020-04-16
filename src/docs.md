---
layout: base
title: Documentation
eleventyNavigation:
  key: Documentation
  order: -1
---
# Documentation

## Requirements

You will need the following **free** services to use Speedscanner. Alternatives are available, but they will likely require changes to functions (contributions welcome!).

- WebPageTest API key, [request one here](https://www.webpagetest.org/getkey.php)
- [Netlify](https://www.netlify.com/) account
- [Fauna](https://fauna.com/) account
- [IFTTT](https://ifttt.com/) account

## Installation

### I. FaunaDB Database

1. Create database, no particular name necessary.
2. Create an API key from "Security" with "Server" role.
3. Make a note of the Key Secret, we will use this later and you can only see it once.
4. Create two collections. One will contain page configuration, the other your tests. For example 'site_pages' and 'site_pages'.
5. For each collection, add two new indexes. The first should be named as the collection but with `all_` prefixed, all other settings default. The second should be named as the collections but with `unique_` prefixed and `_id` suffixed. eg, `unique_site_pages_id`. Set Terms to `id` and check "Unique".
6. Now we create our configuration documents in our page configuration collection. For each page you want to test, create a document in your pages collection with the following format (excluding comments):
```
{
  "id": "home", // unique identifier for each page
  "title": "Home Page", // title for page used in frontend
  "url": "https://speedscanner.org", // full URL to test
  "freq": 4, // number of hours to leave between each test
  "options": {
    // custom configuration for WebPageTest.
    // for config parameters, see npmjs.com/package/webpagetest
    // if not specified, default parameters will be used
  }
}
```

### II. Functions and Interface

1. Fork this repository into your own GitHub account or organisation.
2. In Netlify, create a New Site from Git.
3. Select the forked repository
4. Click "Show advanced" button above the Deploy site button.
5. Set five Environment Variables:
```
DB_PAGES      name of fauna config/pages collection. eg, site_pages
DB_TESTS      name of fauna test collection. eg, site_tests
FAUNA_SECRET  secret key you created for your fauna database
WPT_KEY       API key you obtained from WebPageTest
FORCE_KEY     custom secret string, recommended randomised 30-50char
```
(keep the force key secret, this allows you to manually trigger tests regardless of the cofngured frequency)

6. Click deploy
7. By default a random URL is created, you can customise this in Settings.
8. Once deployed, trigger the first tests by navigating to yourdomain.netlify.com/.netlify/functions/trigger

### III. 'Cron' job

This simply needs to be an hourly GET request to yourdomain.netlify.com/.netlify/functions/trigger. To keep with serverless metholody you could use IFTTT or Zapier among others, or you could set up a cron job with curl/wget. The demo above uses an IFTTT applet with a trigger of "Time" and task of "Webhook", that fires a GET requst to the configured address every hour.

If a test is due to run it will be triggered, otherwise it will return with 200 with a message including the next allowed run time.

### IV. Customisation (optional)

1. Install dependencies with `npm install`
2. Install netlify dev cli with ```npm install netlify-cli -g```
3. Run with ```netlify dev```
