const chalk = require('chalk')
const { program } = require('commander')
const App = require('./app')
const { Repo: RepoComments } = require('./request')

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

/**
 * Date to limit results
 *
 * @type String
 */
const limitDate = app.limitDate?.toISOString().replace(/\.\d{3}(?=Z$)/i, '')

console.log()
// make request to repo comments
async function fetchRepoComments() {
    const repoComments = new RepoComments(app.repo).fetch()
    // todo check created_at against limitDate
    const dataGenerator = app.processResponse(repoComments, ({id, user, created_at}, i) => [i, id, user.login, created_at])
    let i = 0
    for await (const result of dataGenerator) {
        console.info(++i, 'Response data')
        console.log(result)
    }
}

fetchRepoComments()
