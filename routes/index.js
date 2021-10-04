var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

router.get('/fetch', async (req, res, next) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ height: 768, width: 1024 });
  await page.goto('https://www.indiehackers.com/milestones/');

  //await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await page.waitForTimeout(5000);

  await autoScroll(page);

  //.replace(new RegExp('\\n', 'g'), '')
  var element = await page.$$eval('.milestone-entry__link', (anchors) => {
    return anchors.map((anchor) => {
      return { id: anchor.id, title: anchor.textContent, url: anchor.href, date: new Date() };
    });
  });

  var keywords = [
    'customer',
    'paying',
    'mrr',
    'MRR',
    'arr',
    'ARR',
    'first customer',
    '1st customer',
    'first client',
    '1st client',
  ];
  // element.forEach((item) => console.log(item.title.trim()))
  element = element.filter((anchor) => {
    var exists = false;
    keywords.forEach((keyword) => {
      if (anchor.title.indexOf(keyword) !== -1) {
        exists = true;
      }
    });
    return exists;
  });

  await browser.close();

  res.send(element);
});

module.exports = router;
