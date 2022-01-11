const { timeManager } = require('./timeManager');
const { readFile } = require('./promisifedFunctions')
const { remote } = require('webdriverio');
const path = require('path');

const baseDirectory = ['.'];
const inputFile = 'input.txt';

async function testWebsite(url) {
    const browser = await browserConfig();
    await browser.url(url);
    const elem = await browser.$('#testId');
    try{
        await timeManager.elapsed(url, () => {
            return elem.waitUntil(async () => {
                if ((await elem.getText()) === 'TRUE') {
                    timeManager.pass(url);
                }
                return (await elem.getText()) === 'TRUE'
            }, {
                timeout: 10000,
                timeoutMsg: 'Loading took more than 10 seconds'
            });
        })
    }catch(err){
        console.log(url, 'Loading took more than 10 seconds');
    }finally{
        await browser.deleteSession();
    }
}


async function browserConfig() {
    const browser = await remote({
        capabilities: {
            browserName: 'chrome'
        }
    })
    return browser;
}

async function getUrlsFromInputFile() {
    const destination = path.join(...baseDirectory, inputFile);
    const data = await readFile(destination);
    return data.trim().split(/[\r, \n]+/);
}

async function runMultipleUrls() {
    const urls = await getUrlsFromInputFile();
    Promise.all(
        urls.map(async (url) => {
            await testWebsite(url);
        })
    )
    timeManager.show();
}

exports.runMultipleUrls = runMultipleUrls;