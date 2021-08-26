const axios = require('axios')

/**
 * @class CommentRequest
 * @classdesc Base request for comments
 */
module.exports = class CommentRequest {
    constructor() {
       /**
        * Base URL
        *
        * @type String
        */
        this.baseUrl = 'https://api.github.com'
        /**
         * HTTP headers
         *
         * @type Object
         */
        this.headers = {
            'accept': 'application/vnd.github.v3+json'
        }
        /**
         * Request parameters
         */
        this.queryParams = {}

        this.initClient()

        /**
         * Relative URL to make request to
         * Should be explicitly set in any subclasses
         *
         * @type String
         */
         this.url = undefined
    }

    /**
     * Initialize HTTP client
     * @returns this
     */
    initClient() {
        /**
         * HTTP client
         *
         * @type axios
         */
        this.client = axios.create({
           baseURL: this.baseUrl,
           headers: this.headers,
           timeout: 2000
        })

        return this
    }

    /**
     * @yields Promise
     * @throws
     */
    *fetch() {
        if (this.url === undefined) {
            throw new Error('URL not set')
        }

        yield this.client.get(this.url, {
            params: this.queryParams
        })
    }
}
