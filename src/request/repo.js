const { App: AppEvents } = require('../events')

/**
 * @class RepoComments
 * @classdesc Request for repo comments
 */
module.exports = class RepoComments extends require('./base') {
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
        return `/repos/${this.repo}/comments`
    }

    /**
     * @inheritdoc
     */
    async *fetch(queryParams = {}) {
        this.queryParams.per_page = 100
        let page = 0

        while (++page > 0) {
            AppEvents.Emitter.emit(AppEvents.Enum.beforeRequest, `Fetching repo comments: page ${page}`)

            this.queryParams.page = page
            yield* super.fetch(queryParams)
        }
    }
}
