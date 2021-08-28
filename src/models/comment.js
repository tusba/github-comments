/**
 * @class Comment
 * @classdesc Comment model
 */
module.exports = class Comment {
    constructor() {
        /**
         * Comment ID
         *
         * @type Number
         */
        this.id = undefined
        /**
         * Comment creation date in UTC format
         *
         * @type String
         */
        this.createdAt = undefined
        /**
         * Comment author info
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
