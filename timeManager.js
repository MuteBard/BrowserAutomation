'use strict';

const NS_PER_SEC = 1e9;
const MS_PER_SEC = 1e3;

class TimeManager {
    constructor() {
        this.logData = new Map();
    }

    start(url) {
        const tm = this.logData.get(url);
        if (tm) {
            this.logData.set(`${url}`, {
                ...tm,
                url,
                start: process.hrtime(),
            });
        } else {
            this.logData.set(`${url}`, {
                url,
                start: process.hrtime(),
                passed: false
            });
        }
    }
    stop(url) {
        const tm = this.logData.get(url);
        if (tm) {
            const urlData = this.logData.get(url);
            const sec = process.hrtime(urlData.start)[0] + process.hrtime(urlData.start)[1] / NS_PER_SEC;
            const ms = Math.trunc(sec * MS_PER_SEC);

            this.logData.set(`${url}`, {
                ...tm,
                elapsed: ms
            });
        }
    }

    pass(url) {
        const tm = this.logData.get(url);
        if (tm) {
            this.logData.set(`${url}`, {
                ...tm,
                passed: true
            });
        } else {
            this.logData.set(`${url}`, {
                url,
                passed: true
            });
        }
    }

    fail(url) {
        const tm = this.logData.get(url);
        if (tm) {
            this.logData.set(`${url}`, {
                ...tm,
                passed: false
            });
        } else {
            this.logData.set(`${url}`, {
                url,
                passed: false
            });
        }
    }

    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    addProperty(url, name, value) {
        const tm = this.logData.get(url);
        if (tm) {
            this.logData.set(`${url}`, {
                ...tm,
                [name]: value
            });
        } else {
            this.logData.set(`${url}`, {
                url,
                passed: false,
                [name]: value
            });
        }
    }

    async elapsed(url, func) {
        let result = undefined;
        this.start(url);

        try {
            result = await func();
        }
        finally {
            this.stop(url);
        }
        return result;
    }

    show() {
        const urlData = Array.from(this.logData.values());
        const passed = urlData
            .filter((url) => url.passed)
            .map((url) => {
                delete url['passed'];
                delete url['start'];
                return url;
            })
            .sort((a, b) => {
                return a.order - b.order
            })

        const failed = urlData
            .filter((url) => url.passed === false)
            .map((url) => {
                delete url['passed'];
                delete url['start'];
                return url;
            })
            .sort((a, b) => {
                return a.order - b.order
            })

        const report = {
            passed: {
                count: `${passed.length} / ${passed.length + failed.length}`,
                list: passed
            },
            failed: {
                count: `${failed.length} / ${passed.length + failed.length}`,
                list: failed
            }
        };

        console.log(JSON.stringify(report, null, 4));
    }
}
// `*/${minutes} * * * *`

const timeManagerInstance = new TimeManager();
const timeManager = {
    start: (url) => { return timeManagerInstance.start(url); },
    stop: (url) => { return timeManagerInstance.stop(url); },
    sleep: (milliseconds) => { return timeManagerInstance.sleep(milliseconds); },
    elapsed: async (url, func) => { return timeManagerInstance.elapsed(url, func); },
    pass: (url) => { timeManagerInstance.pass(url) },
    fail: (url) => { timeManagerInstance.fail(url) },
    show: () => { timeManagerInstance.show(); },
    addProperty: (url, name, value) => { timeManagerInstance.addProperty(url, name, value); }
};

exports.timeManager = timeManager;
