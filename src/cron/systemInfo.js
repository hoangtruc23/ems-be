const { CronJob } = require('cron')
const si = require('systeminformation');

const systemInfo = new CronJob('0 */1 * * * *', async () => {
    try {
        const data = await si.mem();
        console.log(data);
    } catch (e) {
        console.error(e);
    }
})

systemInfo.start()
