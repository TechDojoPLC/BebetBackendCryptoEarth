const CronJob = require("cron").CronJob;


const job = new CronJob(
  "0 0 * * *",
  function () {
    console.log("Running cron...");
  },
  null,
  true,
  "Europe/Zurich"
);
job.start();
