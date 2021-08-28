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
    days && (app.period = days)
} catch (err) {
    console.error(chalk.red(err.message))
    process.exit(1)
}

// inform about user input before starting
{
    const strPeriod = app.periodDays ? ` for past ${app.periodDays} days` : ''
    console.log(chalk.white(`\n  Fetching comments${strPeriod} for "${app.repo}"...`))
}

console.log()
// make request to repo comments
app.fetchComments(console.log)
