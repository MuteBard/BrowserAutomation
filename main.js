const { runWebsites } = require('./websiteCheck');
const { timeManager } = require('./timeManager');
const cron = require('node-cron');

// async function runTaskNow(){
    // const urlData = await getUrls();
    // // const milliseconds = partitionedUrls.length * (60 * 1000 + 1000);
    // let index = 0;
    // let interval = setInterval(async () => {
    //     if(index < urlData.length){
    //         await runMultipleUrls(urlData[index]);
    //         index++;
    //     }else{
    //         clearInterval(interval);
    //     }
    // }, 10000);


    // let index = 0;
    // const task = cron.schedule('* * * * *', async () => {
    //     const partitionedUrl = partitionedUrls[index];
    //     if(index >= partitionedUrls.length){
    //         console.log("Ending Task for the hour")
    //     }
    //     if(index < partitionedUrls.length){
            
    //         index++;
    //     }
    // });

    // setTimeout(() => {
    //     task.stop()
    //     console.log("Task terminated")
    // }, milliseconds);
// }

async function getReportforhour(){
    await runWebsites();
    // timeManager.show();
}

(async()=>{
    await getReportforhour();
})()
