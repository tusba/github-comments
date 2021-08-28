/**
 * @class UserData
 * @classdesc User data model
 */
module.exports = class UserData {
    /**
     * @param {Number} id - User ID
     */
    constructor(id) {
        /**
         * User ID
         *
         * @type Number
         */
        this.id = id
        /**
         * User login names
         *
         * @type Set<String>
         */
        this.logins = new Set()
        /**
         * Number of user comments
         *
         * @type Number
         */
        this.commentCount = 0
        /**
         * Number of user commits
         *
         * @type Number
         */
        this.commitCount = 0
    }

    /**
     * Single user login name
     *
     * @returns {String}
     */
    get login() {
        return [...this.logins].join('/')
    }

    /**
     * @param {String} value
     */
    set login(value) {
        this.logins.add(value)
    }
}
