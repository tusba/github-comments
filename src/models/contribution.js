/**
 * @class Contribution
 * @classdesc Contribution activity model
 */
 module.exports = class Contribution {
    constructor() {
        /**
         * Total number of commits
         *
         * @type Number
         */
        this.commitCount = undefined
        /**
         * Contributor info
         *
         * @type Object
         */
        this.author = {
            /**
             * User ID
             *
             * @type Number
             */
            id: undefined,
            /**
             * User login name
             *
             * @type String
             */
            login: undefined
        }
    }
}
