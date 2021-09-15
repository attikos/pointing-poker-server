const UIDGenerator = require('uid-generator');
const { camelize, decamelize } = require('../../../utils/camelize');

const Database = use('Database');
const User = use('App/Models/User');
const Game = use('App/Models/Game');
const UserGame = use('App/Models/UserGame');

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

        return response.json({ success: 1, token });
    }

    async newGame({ request, response }) {
        const trx = await Database.beginTransaction();
        let { form, game_nice_id, token } = decamelize(request.all());
        let result = {};
        let user;
        let game;

        let errors = await User.validate(form);

        if (errors) {
            return response.json({ errors });
        }

        if (!token) {
            token = uidgen.generateSync();
        }

        user = await User.findBy('token', token);

        if (user) {
            user.fill({ ...user.toJSON(), ...form });
            await user.save(trx);
        } else {
            user = await User.create({ ...form, token }, trx);
            // await user.reload();
        }

        // It's a player trying to connect into the game
        if (game_nice_id) {
            game = await Game.findBy('nice_id', game_nice_id);

            if (!game) {
                errors = {
                    game_nice_id: 'Wrong game ID!',
                };

                await trx.rollback();

                return response.json({ errors });
            }
        } else {
            // it's Diller creating the new game
            // create game with user_id
            game = await Game.create({ user_id: user.id }, trx);
            await game.save();
        }

        // const userGame = await UserGame.create({ user_id: user.id, game_id: game.id }, trx);
        // await userGame.save();

        await trx.commit();

        // get new members list - members
        // const members = await Database
        //     .table('user_games')
        //     .select('user_id')
        //     .where('game_id', game.id)
        //     .groupBy('user_id');

        // const members2 = await Database
        //     .select('users.*')
        //     .from('users')
        //     .leftJoin('user_games', 'users.id', 'user_games.user_id')
        //     .where('user_games.game_id', game.id)
        //     .groupBy('users.id');

        // console.log('members2', members2);
        console.log('game.id', game.id);
        console.log('game.nice_id', game.nice_id);

        result = {
            success: 1,
            token,
            roomId: game.nice_id, // roomId
        };

        // this.socket.emit('newGame', camelize(result));
        // this.socket.broadcastToAll('members', camelize(members));

        return response.json(camelize(result));
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
