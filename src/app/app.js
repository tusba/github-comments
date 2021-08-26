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
}
