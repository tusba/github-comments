const { App: AppEvents } = require('../events')

/**
 * @class Contribution
 * @classdesc Request for contribution activity
 */
module.exports = class Contribution extends require('./base') {
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
        return `/repos/${this.repo}/stats/contributors`
    }

    /**
     * @inheritdoc
     */
    *fetch(queryParams = {}) {
        AppEvents.Emitter.emit(AppEvents.Enum.beforeRequest, 'Fetching contribution activity')
        yield* super.fetch(queryParams)
    }
}
