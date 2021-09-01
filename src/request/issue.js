const { App: AppEvents } = require('../events')

/**
 * @class IssueComments
 * @classdesc Request for issue comments
 */
module.exports = class IssueComments extends require('./base') {
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
        return `/repos/${this.repo}/issues/comments`
    }

    /**
     * @inheritdoc
     */
    async *fetch(queryParams = {}) {
        this.queryParams.sort = 'created'
        this.queryParams.direction = 'desc'

        this.queryParams.per_page = 100
        let page = 0

        while (++page > 0) {
            AppEvents.Emitter.emit(AppEvents.Enum.beforeRequest, `Fetching issue comments: page ${page}`)

            this.queryParams.page = page
            yield* super.fetch(queryParams)
        }
    }
}
