const axios = require('axios')
const config = require('../config')

/**
 * @class RepoRequest
 * @classdesc Base request to fetch data from repo
 */
module.exports = class RepoRequest {
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
            accept: 'application/vnd.github.v3+json'
        }
        /**
         * Request parameters
         *
         * @type Object
         */
        this.queryParams = {}

        const authToken = config?.GITHUB_PERSONAL_ACCESS_TOKEN
        authToken && (this.headers.Authorization = `token ${config.GITHUB_PERSONAL_ACCESS_TOKEN}`)

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
           timeout: 7000
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
    async *fetch(queryParams = {}) {
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
