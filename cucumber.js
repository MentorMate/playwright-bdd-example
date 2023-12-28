const common = {
  paths: ['acceptance/features/**/*.feature'],
  require: ['acceptance/step_definitions/**/*.ts'],
  requireModule: ['ts-node/register'],
  format: [
    'summary',
    'progress-bar',
    'json:reports/cucumber_report.json',
  ],
  formatOptions: { snippetInterface: 'async-await' },
};

module.exports = {
   chrome: {
    ...common,
    worldParameters: {
      browser: 'CHROMIUM',
      headless: true
    }
   },
   firefox: {
    ...common,
    worldParameters: {
      browser: 'FIREFOX',
      headless: true
    }
   }
};
