const MiddlewareBase = require('@adonisjs/middleware-base');
const { camelize, decamelize } = require('../../../utils/camelize');

const User = MiddlewareBase.use('App/Models/User');
const Game = MiddlewareBase.use('App/Models/Game');

// async function saveMessage({ data, auth }) {
//     const { content, type } = data;
//     const message = new Message();
//     const user = await auth.getUser();

//     message.user_id = user.id || 0;
//     message.type = type;
//     message.content = content;
//     message.uploaded = true;

//     try {
//         await message.save();
//     } catch (error) {
//         console.log('error', error);

//         return { error: 'SYSTEM_ERROR' };
//     }

//     return message;
// }

class GameController {
    constructor({ socket, request, auth }) {
        this.socket = socket;
        this.request = request;
        // this.auth = auth;
        this.token = token;

        // create user / update user

        // return success, game
        // if ( user && game ) {

    // socket.emit('all', { game, members, issues, scores})
    // socket.emit('game', game)
    // socket.emit('members', members)
    // socket.emit('issues', issues)
    // socket.emit('scores', scores)
    // }
    }

    static async onNewGame(data) {
        const { form, game_nice_id } = decamelize(data);
        let result = {};
        let user;
        let game;

        let errors = User.validate(form);

        if (errors) {
            result = { errors };

            this.socket.emit('newGame', camelize(result));
        }

        user = User.findBy('token', this.token);
        const userParams = { ...form, token: this.token };

        if (user) {
            user.fill(userParams);
            await user.save();
        } else {
            user = await User.create(userParams);
            await user.reload();
        }

        // It's a player
        if (game_nice_id) {
            game = Game.findBy('nice_id', game_nice_id);

            if (!game) {
                result = {
                    errors: {
                        game_nice_id: 'Wrong game ID!',
                    },
                };
                this.socket.emit('newGame', camelize(result));
                return;
            }
        } else {
            // it's Diller
            // create game with user_id
            game = await Game.create({ user_id: user.id });
            game.user_id = user.id;
            game.save();
        }

        user = new User();

        // get new members list - members
        const members = [];

        result = {
            success: 1,
        };

        this.socket.emit('newGame', camelize(result));
        this.socket.broadcastToAll('members', camelize(members));
    }

    // async onMessage(data) {
    //     const message = await saveMessage({ data, auth: this.auth });

    //     message.participantId = message.user_id;

    //     this.socket.broadcastToAll('message', message);
    // }

    // async onViewed(messageIdList) {
    //     await Message
    //         .query()
    //         .whereIn('id', messageIdList)
    //         .andWhere('viewed', false)
    //         .update({ viewed: true });

    //     this.socket.broadcastToAll('viewed', messageIdList);
    // }
}

module.exports = GameController;
