const { timeManager } = require('./timeManager');
const { remote } = require('webdriverio');

async function testWebsite(url) {
  ; (async () => {
    const browser = await remote({
      capabilities: {
        browserName: 'chrome'
      }
    })

    await browser.url(url);

    const elem = await browser.$('#testId');

    await timeManager.elapsed(url, () => {
      return elem.waitUntil(async () => {
        if ((await elem.getText()) === 'TRUE') {

        }
        return (await elem.getText()) === 'TRUE'
      }, {
        timeout: 20000,
        timeoutMsg: 'expected text to be different after 20s'
      });
    })

    await browser.deleteSession()
  })()
}


(async () => {
  const url = 'http://flashy-van.surge.sh/';
  await testWebsite(url);
  timeManager.show();
})()


