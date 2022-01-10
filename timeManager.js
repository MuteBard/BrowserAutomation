'use strict';

const NS_PER_SEC = 1e9;
const MS_PER_SEC = 1e3;

class TimeManager {
    constructor() {
        this.logData = new Map();
    }

    start(url){
        this.logData.set(`${url}`, {
            start: process.hrtime()
        });
    }
    stop(url){
        const urlData = this.logData.get(url);
        const sec = process.hrtime(urlData.start)[0] + process.hrtime(urlData.start)[1] / NS_PER_SEC;
        const ms = Math.trunc(sec * MS_PER_SEC);
        this.logData.set(`${url}`, {
            start: process.hrtime(),
            elapsed: ms
        });
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
        let urls = Array.from( this.logData.keys());
        urls.forEach((url) => {
            const tm = this.logData.get(url);
            console.log({
                elapsed: tm.elapsed
            })
        });
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
    show: () => { timeManagerInstance.show();}
};

exports.timeManager = timeManager;
