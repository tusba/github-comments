const { App: AppEvents } = require('../events')

/**
 * @class PullComments
 * @classdesc Request for pull comments
 */
module.exports = class PullComments extends require('./base') {
    /**
     * @inheritdoc
     */
    constructor(repo) {
        super(repo)
    }

    /**
     * @inheritdoc
     */
    get url() {
        return `/repos/${this.repo}/pulls/comments`
    }

    /**
     * @inheritdoc
     */
    async *fetch(queryParams = {}) {
        this.queryParams.sort = 'created_at'
        this.queryParams.direction = 'desc'

        this.queryParams.per_page = 100
        let page = 0

        while (++page > 0) {
            AppEvents.Emitter.emit(AppEvents.Enum.beforeRequest, `Fetching pull comments: page ${page}`)

            this.queryParams.page = page
            yield* super.fetch(queryParams)
        }
    }
}
