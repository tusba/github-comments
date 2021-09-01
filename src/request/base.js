const axios = require('axios')
const { App: AppEvents } = require('../events')
const config = require('../config')

/**
 * @class RepoRequest
 * @classdesc Base request to fetch data from repo
 */
module.exports = class RepoRequest {
    /**
     * Shared HTTP client to fetch rate limit
     *
     * @type RepoRequest
     */
    static rateLimitClient = null

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

        await RepoRequest.fetchRateLimit()

        // apply parameters from outside
        Object.assign(this.queryParams, queryParams)

        yield this.client.get(this.url, {
            params: this.queryParams
        })
    }

    /**
     * Fetch rate limit data
     */
    static async fetchRateLimit() {
        if (!constructor.rateLimitClient) {
            constructor.rateLimitClient = new RepoRequest(undefined)
        }

        const { data: rateLimit } = await constructor.rateLimitClient.client.get('/rate_limit')
        AppEvents.Emitter.emit(AppEvents.Enum.rateLimit, rateLimit.rate)
    }
}
