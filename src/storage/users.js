const { UserData: UserDataModel } = require('../models')

/**
 * @class UserData
 * @classdesc Storage for information about user's comments and commits
 */
module.exports = class UserData {
    constructor() {
        /**
         * Map object to store user info
         *
         * @type Map<Number, UserDataModel>
         */
        this.map = new Map()
    }

    /**
     * Add comment to user
     *
     * @param {Number} userId - User ID to add comment to
     * @param {String} userLogin - Optional user login name
     * @returns this
     */
    addComment(userId, userLogin = undefined) {
        const isNewEntry = !this.map.has(userId)
        const userData = isNewEntry ? new UserDataModel(userId) : this.map.get(userId)

        userLogin && (userData.login = userLogin)
        userData.commentCount++
        isNewEntry && this.map.set(userId, userData)

        return this
    }

    /**
     * Get user data as sorted list:
     * a) by number of comments - descending
     * b) by user login name - ascending
     *
     * @returns UserDataModel[]
     */
    get orderedList() {
        return [...this.map.values()].sort((a, b) => {
            if (a.commentCount !== b.commentCount) {
                return b.commentCount - a.commentCount
            }

            return a.login < b.login ? -1 : 1
        })
    }

    /**
     * Get number of user data items
     *
     * @returns Number
     */
    get size() {
        return this.map.size
    }
}
