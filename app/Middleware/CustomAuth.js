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
        // call next to advance the request
        await next();
    }

    /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
    async wsHandle(ctx, next) {
        const { token } = ctx.request.get();

        console.log('token 2 ', token);

        // ctx.auth = {
        //     token
        // }

        ctx.token = token;

        if (!token) {
            console.error('Token not found');

            // throw new Exception('There is no concept of login in auth', 401);
            // return;
        }

        await next();
    }
}

module.exports = CustomAuth;
