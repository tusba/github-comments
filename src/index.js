const chalk = require('chalk')
const { program } = require('commander')
const App = require('./app')
const { Users: UserStorage } = require('./storage')

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

console.log() // just an empty line
// make request to fetch comments and group them by author
async function run() {
    const userData = new UserStorage()

    await app.fetchComments(/** @param {Comment[]} comments */ comments => {
        for (const comment of comments) {
            console.log(comment)
            userData.addComment(comment.author.id, comment.author.login)
        }
    })

    userData.orderedList.forEach(/** @param {UserDataModel[]} info */ info => {
        console.log(`comments: ${info.commentCount}, user: #${info.id} ${info.login}, commits: ${info.commitCount}`)
    })
}

run()
