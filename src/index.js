const chalk = require('chalk')
const { program } = require('commander')
const App = require('./app')

// parse command line options
program
    .requiredOption('--repo <id>', 'repository ID is required')
    .option('--period <interval>', 'number of days followed by "d"')
    .parse()

const { repo: repoId, period: days } = program.opts()

// initialize application
const app = new App(repoId)
try {
    days && app.setPeriod(days)
} catch (e) {
    console.error(chalk.red(e.message))
    process.exit(1)
}

console.log(app.repo, app.periodDays)
