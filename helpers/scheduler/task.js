const { CronJob } = require('cron');

const apiCallJob = new CronJob(
    '0/5 * * * * *',  // Adjust cron syntax based on your requirement for 1 hour
    () => {
     console.log('Hey')
    },
    null,
    true  // Start the job immediately
  );

module.exports = {
    apiCallJob
}