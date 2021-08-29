const axios = require('axios')

/**
 * @class CommentRequest
 * @classdesc Base request for comments
 */
module.exports = class CommentRequest {
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
         *
         * @type Object
         */
        this.queryParams = {}

        this.initClient()
    }

    /**
     * Relative URL to make request to
     * Should be explicitly overridden in any subclasses
     *
     * @returns {String}
     */
    get url() {
        throw new Error('Abstract getter')
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
     * Fetch data over HTTP
     *
     * @param {Object} queryParams - additional request parameters
     * @yields Promise
     * @throws
     */
    *fetch(queryParams = {}) {
        if (this.url === undefined) {
            throw new Error('URL not set')
        }

        // apply parameters from outside
        Object.assign(this.queryParams, queryParams)

        yield this.client.get(this.url, {
            params: this.queryParams
        })
    }
}
