module.exports = class ContentError extends Error {
    constructor(message, context) {
        super(message);

        this.name = 'ContentError';
        this.context = context;
    }
};