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
     * @param {Generator} request - Generator with request result
     * @param {(Object) => Comment} convert - Callback to convert response data to comment model
     * @yields Comment
     * @throws
     */
    async *processResponse(request, convert) {
        try {
            for await (const response of request) {
                const responseData = response.data

                if (!responseData.length) {
                    // if data array is empty then it's done
                    return
                }

                yield responseData.map(convert)
            }
        } catch (err) {
            console.error('Request processing failed', err.message)
            throw err
        }
    }
}
