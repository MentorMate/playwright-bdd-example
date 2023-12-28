const reporter = require('cucumber-html-reporter')
const date = new Date();

reporter.generate({
  brandTitle: 'Test Scenarios',
  theme: 'bootstrap',
  jsonFile: 'reports/cucumber_report.json',
  output: 'reports/cucumber_report_' + date.getTime() + '.html',
  reportSuitesAsScenarios: true,
  launchReport: true,
  metadata: {
    'App Version': '1.1.1',
    'Test environment': 'QA',
    Platform: 'web/React',
    Sprint: '001'
  }
});
