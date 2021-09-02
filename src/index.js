const chalk = require('chalk')
const { program } = require('commander')
const App = require('./app')
const { App: AppEvents } = require('./events')
const { fetchRateLimit } = require('./request')
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
  console.log(
    '\n  ' + chalk.white(`Fetching comments${strPeriod} for "${app.repo}"...`),
  )
}

const rate = {
  initialized: false,
  limit: undefined,
  remaining: undefined,
  used: undefined,
}

AppEvents.Emitter.on(AppEvents.Enum.rateLimit, ({ limit, remaining, used }) => {
  rate.initialized = true

  rate.limit = limit
  rate.remaining = remaining
  rate.used = used

  if (!remaining) {
    console.error(chalk.red('Rate limit is exceeded'))
    process.exit(2)
  }
})

async function initProgressIndicator() {
  const ora = (await import('ora')).default({
    spinner: 'bouncingBar', // on windows always 'line'
    prefixText: '\n ',
  })

  AppEvents.Emitter.on(AppEvents.Enum.beforeRequest, (description) => {
    const { used, limit } = rate
    const strRate = rate.initialized
      ? ` [${used} request(s) of ${limit} used]`
      : ''
    ora.text = `${description}${strRate}`
  })

  return ora
}

/**
 * Fetch and process results
 *
 * @returns UserDataModel[]
 */
async function run() {
  const userData = new UserStorage()

  // make request to fetch comments and group them by author
  await app.fetchComments(
    /** @param {Comment[]} comments */
    (comments) => {
      // eslint-disable-next-line prettier/prettier
      for (const { author: { id, login } } of comments) {
        userData.addComment(id, login)
      }
    },
  )

  if (!userData.size) {
    return []
  }

  // make request to fetch contribution activity and add it to authors
  await app.fetchContributions(
    /** @param {Contribution} */
    ({ author: { id }, commitCount }) => {
      userData.addContribution(id, commitCount)
    },
  )

  return userData.orderedList
}

async function main() {
  const progressIndicator = (await initProgressIndicator()).start('\n')
  await fetchRateLimit() // initialize shared HTTP client
  const results = await run()
  progressIndicator.succeed('Done\n')

  if (!results.length) {
    console.log(chalk.white('No data available'))
    return
  }

  // output sorted and formatted results
  const maxCommentCountLength = String(results[0].commentCount).length

  results.forEach(
    /** @param {UserDataModel[]} info */
    (info) => {
      const strCommentCount = String(info.commentCount).padStart(
        maxCommentCountLength,
      )
      const strLogin = info.login || 'N/A'
      const strCommitCount = info.login ? ` (${info.commitCount} commits)` : ''
      console.log(
        chalk.white(
          `${strCommentCount} comments, ${strLogin}${strCommitCount}`,
        ),
      )
    },
  )
}

main()
