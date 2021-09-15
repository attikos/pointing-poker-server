const UIDGenerator = require('uid-generator');
const { camelize, decamelize } = require('../../../utils/camelize');

const Database = use('Database');
const User = use('App/Models/User');
const Game = use('App/Models/Game');

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

        await trx.commit();

        console.log('game.id', game.id);
        console.log('game.nice_id', game.nice_id);

        result = {
            success: 1,
            token,
            roomId: game.nice_id, // game_nice_id === roomId
        };

        return response.json(camelize(result));
    }
}

module.exports = UserController;
