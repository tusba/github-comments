const chalk = require('chalk')
const { program } = require('commander')
const App = require('./app')
const { Repo } = require('./request')

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
} catch (e) {
    console.error(chalk.red(e.message))
    process.exit(1)
}

// inform about user input before starting
{
    const strPeriod = app.periodDays ? ` for past ${app.periodDays} days` : ''
    console.log(chalk.white(`\n  Fetching comments${strPeriod} for "${app.repo}"...`))
}

console.log();
// make request to repo comments
const repo = new Repo(app.repo)
repo.fetch().next().value
    .then(response => {
        console.info('Response data', response.data)
    })
    .catch(error => {
        console.error('Request failed', error.message)
    })
