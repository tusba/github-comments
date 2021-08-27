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
    *fetch() {
        this.queryParams.per_page = 100
        let page = 0

        while (++page > 0) {
            this.queryParams.page = page
            yield* super.fetch()
        }
    }
}
