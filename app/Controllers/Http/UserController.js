const UIDGenerator = require('uid-generator');

const uidgen = new UIDGenerator(32);

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with users
 */
class UserController {
    // API for PP
    async checkToken({ request, response }) {
        let { token } = request.all();

        if (!token) {
            token = uidgen.generateSync();
        }
        console.log('token: ', token);

        // try {
        //     console.log('token: ', token);
        // } catch (error) {
        //     console.error(error);
        //     throw error;
        // }

        return response.json({ success: 1, token });
    }

    // static async lobby({ request, response }) {
    //     let user;
    //     let {
    //         token,
    //         firstName,
    //         lastName,
    //         isDiller,
    //         isPlayer,
    //         gameNiceId,
    //     } = decamelize(request.all());

    //     if (token) {
    //         user = await User.findBy('token', token);
    //     }

    //     if (!token || !user) {
    //         token = uidgen.generateSync();

    //         try {
    //             user = await User.create({
    //                 token,
    //                 firstName,
    //                 lastName,
    //                 isDiller,
    //                 isPlayer,
    //                 gameNiceId,
    //             });
    //         } catch (error) {
    //             console.log('error', error);

    //             return response.json({ errorMessage: 'Account already exist' });
    //         }

    //         return response.json({
    //             success: 1,
    //             user: user.prepared(),
    //             message: 'Registration Successful!',
    //         });
    //     }

    //     return response.json({
    //         success: 1,
    //         user: user.prepared(),
    //         message: 'Registration Successful!',
    //     });
    // }

    // async register({ request, auth, response }) {
    //     const { email, password, passwordConfirm } = request.all();
    //     let user;

    //     if (!email) {
    //         return response.json({ errorMessage: 'Email is required' });
    //     }

    //     if (!password) {
    //         return response.json({ errorMessage: 'Password is required' });
    //     }

    //     if (password !== passwordConfirm || !passwordConfirm) {
    //         return response.json({ errorMessage: 'Please confirm your password' });
    //     }

    //     try {
    //         user = await User.create({ email, password });
    //     } catch (error) {
    //         console.log('error', error);

    //         return response.json({ errorMessage: 'Account already exist' });
    //     }

    //     const token = await auth.generate(user);

    //     Object.assign(user, token);

    //     return response.json({
    //         success: 1,
    //         user: user.prepared(),
    //         message: 'Registration Successful!',
    //     });
    // }

    // async login({ request, auth, response }) {
    //     const { email, password } = request.all();

    //     if (!email) {
    //         return response.json({ errorMessage: 'Email is required' });
    //     }

    //     if (!password) {
    //         return response.json({ errorMessage: 'Password is required' });
    //     }

    //     try {
    //         if (await auth.attempt(email, password)) {
    //             const user = await User.findBy('email', email);
    //             const token = await auth.generate(user);

    //             Object.assign(user, token);
    //             return response.json({ success: 1, user: user.prepared() });
    //         }
    //     } catch (e) {
    //         return response.json({ errorMessage: 'Wrong email or password' });
    //     }
    // }

    // async logout({ request, response, auth }) {
    //     const apiToken = auth.getAuthHeader();

    //     await auth
    //         .authenticator('api')
    //         .revokeTokens([apiToken]);

    //     return response.json({ success: 1 });
    // }

    // async check({ request, response, auth }) {
    //     try {
    //         await auth.check();
    //     } catch (error) {
    //         return response.json({ success: 0 });
    //     }

    //     return response.json({
    //         success: 1,
    //         user: auth.user.prepared(),
    //     });
    // }
}

module.exports = UserController;
