const chalk = require('chalk')
const {
  Comment: CommentModel,
  Contribution: ContributionModel,
} = require('../models')
const Requests = require('../request')

/**
 * @class App
 * @classdesc Application wrapper
 */
module.exports = class App {
  /**
   * @param {String} repo - Repository ID
   */
  constructor(repo) {
    /**
     * Repository ID
     *
     * @type String
     */
    this.repo = repo
    /**
     * Number of days
     *
     * @type Number
     */
    this.periodDays = undefined
  }

  /**
   * @return {Date}
   */
  get limitDate() {
    if (!this.periodDays) {
      return undefined
    }

    const d = new Date()
    d.setDate(d.getDate() - this.periodDays)

    return d
  }

  /**
   * @param {String} value
   * @throws
   */
  set period(value) {
    const match = /^(\d+)d$/i.exec(value)
    if (match === null) {
      throw new Error('Wrong format of period')
    }

    this.periodDays = parseInt(match[1], 10)
    if (!this.periodDays) {
      throw new Error('Wrong value of period')
    }
  }

  /**
   * Make requests continouosly and transform response data
   *
   * @param {Generator} response - Generator with request result
   * @param {(Object) => Comment} convert - Callback to convert response data to comment model
   * @param {(Object) => Boolean} filter - Optional callback to filter response data before converting
   * @yields Comment
   * @throws
   */
  async *processResponse(response, convert, filter = undefined) {
    try {
      for await (const result of response) {
        if (!result.data.length) {
          // if data array is empty then it's done
          return
        }

        const responseData =
          typeof filter === 'function'
            ? result.data.filter(filter)
            : result.data

        yield responseData.map(convert)
      }
    } catch (err) {
      console.error(chalk.red('Request processing failed:'), err.message)
      throw err
    }
  }

  /**
   * Fetch comment data from many sources
   *
   * @param {(Array) => void} treat - Callback to process an array of obtained comments
   */
  async fetchComments(treat) {
    // date to limit comments from results
    const limitDate = this.limitDate
      ?.toISOString()
      .replace(/\.\d{3}(?=Z$)/i, '')

    /**
     * Callback to convert response data to comment model
     *
     * @param {Object} responseData
     * @returns Comment
     */
    const cbConvert = ({ id, user, created_at: createdAt }) => {
      const comment = new CommentModel()

      comment.id = id
      comment.createdAt = createdAt
      comment.author.id = user?.id || null
      comment.author.login = user?.login || null

      return comment
    }

    /**
     * Optional callback to filter response data before converting
     *
     * @param {Object} responseData
     * @returns Boolean
     */
    const cbFilter = limitDate
      ? ({ created_at: createdAt }) => createdAt >= limitDate
      : undefined

    /**
     * Options to filter via query params
     */
    const queryFilter = {
      filter: false,
      queryParams: limitDate ? { since: limitDate } : undefined,
    }

    // description for requests
    const requests = [
      // repo comments
      { className: Requests.Repo },
      // issue comments
      { className: Requests.Issue, ...queryFilter },
      // pull comments
      { className: Requests.Pull, ...queryFilter },
    ]

    for (const request of requests) {
      try {
        const RequestClass = request.className
        const response = await new RequestClass(this.repo).fetch(
          request.queryParams,
        )
        const results = this.processResponse(
          response,
          request.convert || cbConvert,
          request.filter === false ? undefined : request.filter || cbFilter,
        )

        for await (const dataItems of results) {
          // dataItems is an array of objects returned by request.convert or cbConvert callback
          treat(dataItems)
        }
      } catch (err) {
        console.error(chalk.red('Comment fetching failed:'), err.message)
      }
    }
  }

  /**
   * Fetch contribution activity data
   *
   * @param {(ContributionModel) => void} treat - Callback to process an obtained contribution
   */
  async fetchContributions(treat) {
    try {
      const response = await new Requests.Contribution(this.repo).fetch()

      for await (const result of response) {
        const contributions = result.data.map(({ total, author }) => {
          const contribution = new ContributionModel()

          contribution.commitCount = total
          contribution.author.id = author?.id || null
          contribution.author.login = author?.login || null

          return contribution
        })

        contributions.forEach(treat)
      }
    } catch (err) {
      console.error(
        chalk.red('Contribution fetching response failed:'),
        err.message,
      )
    }
  }
}
