/**
 * @class RepoComments
 * @classdesc Request for repo comments
 */
module.exports = class RepoComments extends require('./base') {
    /**
     * @param {string} repo - Repository ID
     */
    constructor(repo) {
        super()
        this.url = `/repos/${repo}/comments`
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
