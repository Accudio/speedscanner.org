---
layout: base
title: Home
eleventyNavigation:
  key: Home
  order: -3
---

# Speedscanner — Automated frontend website performance monitoring

<div class="alert alert--warning">
  ⚠️ Due to changes to the <a href="https://blog.webpagetest.org/posts/the-webpagetest-api-has-gone-public/">WebPageTest API</a>, Speed Scanner no longer has a place in continuous frontend synthetic testing. This project has been archived, please move to an alternative solution.
</div>

Unfortunately due to the new pricing of the WebPageTest API, Speed Scanner no longer is a good option for front-end performance monitoring. Although it will still work with the WPT API, the cost of that API means you should probably be looking at using an alternative, more polished service like those listed below.

In future I hope to see whether there is any way that a project like Speed Scanner can exist, and if so perhaps work on Speed Scanner 2. For the moment however, I will be retiring my Speed Scanner instances or replacing them with Speedlify as listed below.

## Alternatives to Speed Scanner

- [Speedlify](https://www.speedlify.dev/) — Open-source performance monitoring tool that can be run and deployed on hosts like Netlify, Vercel and Github Pages. Can be free depending on usage.
- [Calibre](https://calibreapp.com/) — Synthetic monitoring that is really polished and at a reasonable price. They have a fantastic performance-realted newsletter and really seem to know what they're doing.
- [SpeedCurve](https://speedcurve.com/) — Synthetic and RUM monitoring, a bit more expensive than Calibre but also very well-regarded.

---
## Previous homepage for posterity

Synthetic web page testing testing tools like [Google Lighthouse](https://developers.google.com/web/tools/lighthouse/) and [WebPageTest](https://webpagetest.org/) can provide incredibly useful insight into the performance of websites for any web developer. Despite a huge number of backend performance monitoring tools, there are few frontend performance monitoring tools. Among several others, [SpeedCurve](https://speedcurve.com/) and [Calibre](https://calibreapp.com/) provide this service but can prove to be expensive and over-complicated.

Until recently, [SpeedTracker](https://speedtracker.org/) offered a free open-source alternative, however from late-2019 it seems to no longer function and is no longer maintained. Speedscanner is heavily inspired by SpeedTracker but relies on free [serverless](https://serverless.css-tricks.com/) functions rather than a central server in order to be totally disconnected and within complete control of developers.

Whatever your need, SpeedScanner can help you easily monitor the performance of websites for free.

{% image 'screenshot-1', 'Dashboard of a speedscanner installation', 760, 428 %}

### Features

- Monitor frontend web performance regularly
- Visualise performance statistics over time, in addition to individual tests
- Performance data powered by WebPageTest, allowing huge range of testing options
- Google Lighthouse integration included, offering performance, accessibility, best-practice, PWA and SEO scoring at a glance
- No imposed limits, the only restrictions are in the platforms used
- Can be hosted for free using developer services including Netlify, WebPageTest and FaunaDB
- No central server allows for longer lifespan
- Completely open-source allowing developers to tune to their exact needs
