const _ = require('lodash');

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
    async checkGameId({ request, response }) {
        let { game_nice_id } = decamelize(request.all());
        let res;

        const game = await Game.findBy('nice_id', game_nice_id);

        if (!game) {
            res = {
                success: 1,
                errors: {
                    game_nice_id: 'Wrong Game ID',
                },
            };
        } else {
            res = { success: 1 };
        }

        return response.json(camelize(res));
    }

    async newGame({ request, response }) {
        const trx = await Database.beginTransaction();
        let { form, game_nice_id, token } = decamelize(request.all());
        let result = {};
        let user;
        let game;

        const formPicked = _.pick(form, [
            'first_name',
            'last_name',
            'is_diller',
            'is_observer',
            'job',
        ]);

        let errors = await User.validate(formPicked);

        if (errors) {
            return response.json(camelize({ errors }));
        }

        if (!token) {
            token = uidgen.generateSync();
        }

        user = await User.findBy('token', token);

        if (user) {
            user.fill({ ...user.toJSON(), ...formPicked });
            await user.save(trx);
        } else {
            user = await User.create({ ...formPicked, token }, trx);
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

                return response.json(camelize({ errors }));
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
