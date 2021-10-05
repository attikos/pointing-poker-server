const _ = require('lodash');

const UIDGenerator = require('uid-generator');
const { camelize, decamelize } = require('../../../utils/camelize');

const Database = use('Database');
const User = use('App/Models/User');
const Game = use('App/Models/Game');

const uidgen = new UIDGenerator(64);

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with users
 */
class UserController {
    async restoreSession({ request, response }) {
        let { game_nice_id, token } = decamelize(request.all());
        let res;

        if (!game_nice_id) {
            res = {
                success: 1,
                errors: {},
            };

            return response.json(camelize(res));
        }

        if (!token) {
            res = {
                success: 1,
                errors: {
                    token: 'Token is required',
                },
            };

            return response.json(camelize(res));
        }

        const user = await User.findBy('token', token);

        if (!user) {
            res = {
                success: 1,
                errors: {
                    token: 'Session not found',
                },
            };

            return response.json(camelize(res));
        }

        const game = await Game.findBy({ nice_id: game_nice_id });

        if (!game) {
            res = {
                success: 1,
                errors: {
                    game_nice_id: `Game with id ${game_nice_id} not found`,
                },
            };

            return response.json(camelize(res));
        }

        user.is_diller = game.user_id === user.id;
        await user.save();

        res = {
            success: 1,
            token,
            roomId: game.nice_id, // game_nice_id === roomId
        };

        return response.json(camelize(res));
    }

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

        try {
            const formPicked = _.pick(form, [
                'first_name',
                'last_name',
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
                user.merge(formPicked);
                await user.save(trx);
            } else {
                user = await User.create({ ...formPicked, token }, trx);
                await user.save(trx);
            }

            // It's a player OR diller trying to connect into the game
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
                await game.save(trx);
            }

            user.is_diller = game.user_id === user.id;
            await user.save(trx);

            await trx.commit();

            result = {
                success: 1,
                token,
                roomId: game.nice_id, // game_nice_id === roomId
            };
        } catch (error) {
            console.log(error);
            throw error;
        }

        return response.json(camelize(result));
    }
}

module.exports = UserController;
