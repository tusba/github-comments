const chalk = require('chalk')
const { program } = require('commander')
const App = require('./app')
const { App: AppEvents } = require('./events')
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
    console.log('\n  ' + chalk.white(`Fetching comments${strPeriod} for "${app.repo}"...`))
}

async function initProgressIndicator() {
    const ora = (await import('ora')).default({
        spinner: 'bouncingBar', // on windows always 'line'
        prefixText: '\n '
    })

    AppEvents.Emitter.on(AppEvents.Enum.beforeRequest, description => {
        ora.text = description
    })

    return ora
}

async function run() {
    const progressIndicator = (await initProgressIndicator()).start('\n')

    const userData = new UserStorage()

    // make request to fetch comments and group them by author
    await app.fetchComments(/** @param {Comment[]} comments */ comments => {
        for (const comment of comments) {
            userData.addComment(comment.author.id, comment.author.login)
        }
    })

    progressIndicator.succeed('Done\n')

    /**
     * @type UserDataModel[]
     */
    const results = userData.orderedList
    if (!results.length) {
        console.log(chalk.white('No data available'))
        return
    }

    // output sorted and formatted results
    const maxCommentCountLength = String(results[0].commentCount).length
    results.forEach(/** @param {UserDataModel[]} info */ info => {
        const strCommentCount = String(info.commentCount).padStart(maxCommentCountLength)
        const strLogin = info.login || 'N/A'
        const strCommitCount = info.login ? ` (${info.commitCount} commits)` : ''
        console.log(chalk.white(`${strCommentCount} comments, ${strLogin}${strCommitCount}`))
    })
}

run()
