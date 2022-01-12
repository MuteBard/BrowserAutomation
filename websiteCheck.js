const { timeManager } = require('./timeManager');
const { readFile } = require('./promisifedFunctions')
const { remote } = require('webdriverio');
const path = require('path');
const partitionSize = 1;

const baseDirectory = ['.'];
const inputFile = 'input.txt';

async function testWebsite(urlData) {
    const url = urlData.url;

    const browser = await browserConfig();
    await browser.url(url);
    const elem = await browser.$('#menu-content');
    timeManager.addProperty(url, "order", urlData.order);
    
    try{
        await timeManager.elapsed(url, async() => {
            await elem.waitUntil(async () => {
                if ((await elem.isDisplayed())) {
                    timeManager.pass(url);
                    return true;
                }else{
                    timeManager.fail(url);
                    return false;
                }
            }, {
                timeout: 5000,
                timeoutMsg: 'Loading took more than 5000 ms'
            });
        })
    }catch{
        console.log(url,'Loading took more than 5000 ms')
    }finally{
        await browser.deleteSession();
    }
    
}

async function browserConfig() {
    const browser = await remote({
        capabilities: {
            browserName: 'firefox'
        }
    })
    return browser;
}

async function getUrlsFromInputFile() {
    const destination = path.join(...baseDirectory, inputFile);
    const data = await readFile(destination);
    const urls = data.trim().split(/[\r, \n]+/);
    const urlObjs = urls.map((url, order) => {
        timeManager.pass(url);
        return {url, order: order + 1};
    });
    return urlObjs;
}

function partitionUrls(urlObjs){
    const partitions = [];
    let idx = 0;
    
    while(idx < urlObjs.length){
        const partition = urlObjs.slice(idx, idx + partitionSize);
        partitions.push(partition);
        idx += partitionSize;
    }
    return partitions;
}

async function runWebsites(){
    const urlObjs = await getUrlsFromInputFile();
    const partitionedUrlObjects = partitionUrls(urlObjs);
    let index = 0;
    let interval = setInterval(async () => {
        if(index < partitionedUrlObjects.length){
            console.log(index)
            await runMultipleUrls((partitionedUrlObjects[index]));
            index++;
        }else{
            timeManager.show();
            clearInterval(interval);
        }
    }, 30000);
}

async function runMultipleUrls(urlObjs){
    return Promise.all(
        urlObjs.map(async (urlData) => {
            await testWebsite(urlData);
        })
    )
}


exports.runWebsites = runWebsites;