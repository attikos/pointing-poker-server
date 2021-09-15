const { camelize, decamelize } = require('../../../utils/camelize');
const { getRoomId } = require('../../../utils/getRoomId');

const Database = use('Database');
const User = use('App/Models/User');
const Game = use('App/Models/Game');
const UserGame = use('App/Models/UserGame');
class GameController {
    constructor({
        socket, request, token,
    }) {
        this.socket = socket;
        this.request = request;
        this.token = token;
        this.roomId = getRoomId(socket.topic);

        if (!this.roomId) {
            this.socket.emit('error', 'Room is required!');
            this.socket.close();
        }

        this.connected();
    }

    async connected() {
        try {
            const result = await this.getAllData();

            if (result.user && result.game) {
                const userGame = await UserGame.create({
                    user_id: result.user.id,
                    game_id: result.game.id,
                });
                await userGame.save();
            }

            await this.socket.emit('all-data', result);

            console.log('this.token', this.token);
            console.log('A new subscription for room topic', this.roomId);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getAllData() {
        const payload = {};

        payload.user = await User.findBy('token', this.token);
        payload.game = await Game.findBy('nice_id', this.roomId);

        payload.members = await Database
            .select('users.*')
            .from('users')
            .leftJoin('user_games', 'users.id', 'user_games.user_id')
            .where('user_games.game_id', payload.game.id)
            .groupBy('users.id');

        payload.issues = await Database
            .select('issues.*')
            .from('issues')
            .leftJoin('user_scores', 'issues.id', 'user_scores.user_id')
            .where('user_scores.user_id', payload.user.id)
            .groupBy('issues.id');

        payload.scores = await Database
            .select('user_scores.*')
            .from('user_scores')
            .leftJoin('issues', 'issues.id', 'user_scores.issue_id')
            .where('issues.game_id', payload.game.id)
            .groupBy('user_scores.id');

        return payload;
    }

    async onNewGame(data) {
        const trx = await Database.beginTransaction();
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
            await user.save(trx);
        } else {
            user = await User.create(userParams, trx);
            await user.reload();
        }

        // It's a Player
        if (game_nice_id) {
            game = Game.findBy('nice_id', game_nice_id);

            if (!game) {
                result = {
                    errors: {
                        game_nice_id: 'Wrong game ID!',
                    },
                };

                await trx.rollback();

                this.socket.emit('newGame', camelize(result));
                return;
            }
        } else {
            // it's a Diller
            // create game with user_id
            game = await Game.create({ user_id: user.id }, trx);
            game.user_id = user.id;
            await game.save();
        }

        // get a new members
        const members = await UserGame
            .query(trx)
            .where('game_id', game.id)
            .fetch();

        console.log('members toJSON', members.toJSON());

        result = {
            success: 1,
        };

        await trx.commit();

        this.socket.emit('newGame', camelize(result));
        this.socket.broadcastToAll('members', camelize(members));
    }

    async onClose() {
        const user = await User.findBy('token', this.token);
        const game = await Game.findBy('nice_id', this.roomId);

        const userGame = await UserGame.findBy({ user_id: user.id, game_id: game.id });

        if (userGame) {
            await userGame.delete();
        }

        console.log('Closing subscription for room topic', this.socket.topic);
    }
}

module.exports = GameController;
