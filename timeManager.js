'use strict';

const NS_PER_SEC = 1e9;
const MS_PER_SEC = 1e3;

class TimeManager {
    constructor() {
        this.logData = new Map();
    }

    start(url){
        this.logData.set(`${url}`, {
            start: process.hrtime(),
            passed: false
        });
    }
    stop(url){
        const tm = this.logData.get(url);
        if(tm){
            const urlData = this.logData.get(url);
            const sec = process.hrtime(urlData.start)[0] + process.hrtime(urlData.start)[1] / NS_PER_SEC;
            const ms = Math.trunc(sec * MS_PER_SEC);
            
            this.logData.set(`${url}`, {
                ...tm,
                elapsed: ms
            });
        }
    }

    pass(url){
        const tm = this.logData.get(url);
        if(tm){
            this.logData.set(`${url}`, {
                ...tm,
                passed: true
            });
        }
    }

    fail(url){
        const tm = this.logData.get(url);
        if(tm){
            this.logData.set(`${url}`, {
                ...tm,
                passed: false
            });
        }
    }

    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async elapsed(url, func){
        let result = undefined;
        this.start(url);
    
        try {
            result = await func();
        }
        finally {
            this.stop(url);
            console.log(this.show())
        }
        return result;
    }

    show(){
        const urls = Array.from( this.logData.keys());
        const updatedUrls = urls.map((url) => {
            const tm = this.logData.get(url);
            return {
                url,
                elapsed: tm.elapsed,
                passed: tm.passed
            };
        })
        
        const passed = updatedUrls
        .filter((url) => url.passed === true)
        .map((url) => { 
            return {
                url: url.url,
                elapsed: url.elapsed
            };
        });

        const failed = updatedUrls
        .filter((url) => url.passed === false)
        .map((url) => { 
            return {
                url: url.url,
                elapsed: url.elapsed
            };
        });

        return {
            passed,
            failed
        };
    }

    cron(){

    }
}

const timeManagerInstance = new TimeManager();
const timeManager = {
    start: (url) => { return timeManagerInstance.start(url);},
    stop: (url) => { return timeManagerInstance.stop(url);},
    sleep: (milliseconds) => { return timeManagerInstance.sleep(milliseconds);},
    elapsed: async (url, func) => { return timeManagerInstance.elapsed(url, func);},
    pass: (url) => {timeManagerInstance.pass(url)},
    fail: (url) => {timeManagerInstance.fail(url)},
    show: () => { timeManagerInstance.show();}
};

exports.timeManager = timeManager;
