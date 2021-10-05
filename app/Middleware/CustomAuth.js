/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class CustomAuth {
    /**
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Function} next
     */
    async handle(ctx, next) {
        await next();
    }

    /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
    async wsHandle(ctx, next) {
        const { token } = ctx.request.get();

        ctx.token = token;

        if (!token) {
            console.error('Token not found');
        }

        await next();
    }
}

module.exports = CustomAuth;
