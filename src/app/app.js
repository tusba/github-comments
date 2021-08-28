const { Comment: CommentModel } = require('../models')
const CommentRequests = require('../request')

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
     * @returns this
     * @throws
     */
    set period(value) {
        const match = /^(\d+)d$/i.exec(value)
        if (match === null) {
            throw new Error('Wrong format of period')
        }

        this.periodDays = parseInt(match[1])
        if (!this.periodDays) {
            throw new Error('Wrong value of period')
        }

        return this
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

                const responseData = typeof filter === 'function' ? result.data.filter(filter) : result.data

                yield responseData.map(convert)
            }
        } catch (err) {
            console.error('Request processing failed', err.message)
            throw err
        }
    }

    /**
     * Fetch comment data from many sources
     *
     * @param {(Array) => {}} treat - Callback to process an array of obtained comments
     */
    async fetchComments(treat) {
        // date to limit comments from results
        const limitDate = this.limitDate?.toISOString().replace(/\.\d{3}(?=Z$)/i, '')
        // description for requests
        const requests = [
            // repo comments
            {
                class: CommentRequests.Repo,
                convert: ({ id, user, created_at }) => {
                    const comment = new CommentModel()

                    comment.id = id
                    comment.createdAt = created_at
                    comment.author.id = user.id
                    comment.author.login = user.login

                    return comment
                },
                filter: limitDate ? ({ created_at }) => created_at <= limitDate : undefined
            }
        ]

        for (const request of requests) {
            const response = new request.class(this.repo).fetch()
            const results = this.processResponse(response, request.convert, request.filter)

            for await (const dataItems of results) {
                // dataItems is an array of objects returned by request.convert callback
                treat(dataItems)
            }
        }
    }
}
