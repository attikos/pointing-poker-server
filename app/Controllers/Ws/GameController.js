const _ = require('lodash');
const { camelize } = require('../../../utils/camelize');
const { getRoomId } = require('../../../utils/getRoomId');

const Database = use('Database');
const User = use('App/Models/User');
const Game = use('App/Models/Game');
const UserGame = use('App/Models/UserGame');
const UserScore = use('App/Models/UserScore');
const Issue = use('App/Models/Issue');

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
    }

    async connected() {
        try {
            const game = await this.getGame(true);
            const user = await this.getUser();

            if (user && game) {
                const userGame = await UserGame.create({
                    user_id: user.id,
                    game_id: game.id,
                });
                await userGame.save();
            }

            const allData = await this.getAllDataByGameId(game.id);

            this.socket.broadcastToAll('all-data', camelize(allData));
            this.socket.emit('user', camelize(user));
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getUser(isJson) {
        const user = await User.findBy('token', this.token);

        if (user) {
            if (isJson) {
                return user.toJSON();
            }

            return user;
        }

        return false;
    }

    async getGame(isJson) {
        const game = await Game.findBy('nice_id', this.roomId);

        if (game) {
            if (isJson) {
                return game.toJSON();
            }

            return game;
        }

        return false;
    }

    async getMembers(game_id) {
        return Database
            .select('users.*')
            .from('users')
            .leftJoin('user_games', 'users.id', 'user_games.user_id')
            .where('user_games.game_id', game_id)
            .groupBy('users.id');
    }

    async getAllData() {
        const game = await this.getGame();

        if (!game) {
            return false;
        }

        const result = await this.getAllDataByGameId(game.id) || {};

        return camelize({ ...result, game: game.toJSON() });
    }

    async getAllDataByGameId(game_id) {
        const result = {};

        result.scores = await Database
            .select('issues.*')
            .from('issues')
            .leftJoin('user_scores', 'issues.id', 'user_scores.issue_id')
            .where('issues.game_id', game_id)
            .groupBy('issues.id');

        result.issues = await Database
            .select('*')
            .from('issues')
            .where('game_id', game_id)
            .groupBy('issues.id');

        result.usersIssues = {};
        result.issues.forEach((issue) => {
            result.usersIssues[issue.user_id] = issue;
        });

        result.members = await this.getMembers(game_id);

        return result;
    }

    async sendFullData() {
        const result = await this.getAllData();

        if (!result) {
            return;
        }

        this.socket.broadcastToAll('all-data', camelize(result));
    }

    onGetAllData() {
        this.sendFullData();
    }

    async onGetUser() {
        const result = await this.getUser();

        if (!result) {
            return;
        }

        this.socket.emit('user', camelize(result));
    }

    async onStartGame() {
        const game = await this.getGame();
        const user = await this.getUser();

        if (game.user_id !== user.id) {
            return false;
        }

        game.status = 'game';
        await game.save();
        return this.sendFullData();
    }

    async onCancelGame() {
        const game = await this.getGame();
        const user = await this.getUser();

        if (game.user_id !== user.id) {
            return this.onClose();
        }

        game.status = 'result';
        await game.save();

        return this.sendFullData();
    }

    async onStartRound() {
        const game = await this.getGame();
        const user = await this.getUser();

        if (game.user_id !== user.id) {
            return false;
        }

        const issue = Issue.first({ game_id: game.id, is_current: true });

        if (issue) {
            issue.status = 'processing';
            await issue.save();

            return this.sendFullData();
        }

        return false;
    }

    async onStopRound() {
        const game = await this.getGame();
        const user = await this.getUser();

        if (game.user_id !== user.id) {
            return false;
        }

        const issue = Issue.first({ game_id: game.id, is_current: true, status: 'processing' });

        if (!issue) {
            return false;
        }

        const userScore = await UserScore.first({ issue_id: issue.id });
        const issueStatus = userScore ? 'finished' : 'new';

        if (userScore) {
            issue.status = issueStatus;
            await issue.save();

            return this.sendFullData();
        }

        return false;
    }

    async onSetIssueAsCurrent(flag) {
        const game = await this.getGame();
        const user = await this.getUser();

        if (game.user_id !== user.id) {
            return false;
        }

        const issue = Issue.first({ game_id: game.id, is_current: true, status: 'processing' });

        if (!issue) {
            return false;
        }

        issue.is_current = !!flag;
        await issue.save();

        return this.sendFullData();
    }

    async onDeleteUser(userNiceId) {
        const game = await this.getGame();
        const user = await this.getUser();

        if (game.user_id !== user.id) {
            return false;
        }

        const player = await User.findBy('nice_id', userNiceId);
        // const user = await User.query(trx).where('username','virk).first()

        if (player) {
            await player.delete();

            return this.sendFullData();
        }

        return false;
    }

    async onAddScore() {
        return false;
    }

    async onAddIssue(form) {
        const formPicked = _.pick(form, [
            'title',
            'nice_id',
            'link',
            'is_current',
            'priority',
            'status',
            'id',
        ]);

        console.log('formPicked', formPicked);

        try {
            const issue = await Issue.create(formPicked);
            await issue.save();
        } catch (error) {
            console.error(error);
            this.socket.emit('error', { addIssue: error });
            return false;
        }

        return this.sendFullData();
    }

    async onDeleteIssue() {
        return false;
    }

    // async onNewGame(data) {
    //     const trx = await Database.beginTransaction();
    //     const { form, game_nice_id } = decamelize(data);
    //     let result = {};
    //     let user;
    //     let game;

    //     let errors = User.validate(form);

    //     if (errors) {
    //         result = { errors };

    //         this.socket.emit('newGame', camelize(result));
    //     }

    //     user = User.findBy('token', this.token);
    //     const userParams = { ...form, token: this.token };

    //     if (user) {
    //         user.fill(userParams);
    //         await user.save(trx);
    //     } else {
    //         user = await User.create(userParams, trx);
    //         await user.reload();
    //     }

    //     // It's a Player
    //     if (game_nice_id) {
    //         game = Game.findBy('nice_id', game_nice_id);

    //         if (!game) {
    //             result = {
    //                 errors: {
    //                     game_nice_id: 'Wrong game ID!',
    //                 },
    //             };

    //             await trx.rollback();

    //             this.socket.emit('newGame', camelize(result));
    //             return;
    //         }
    //     } else {
    //         // it's a Diller
    //         // create game with user_id
    //         game = await Game.create({ user_id: user.id }, trx);
    //         game.user_id = user.id;
    //         await game.save();
    //     }

    //     // get a new members
    //     const members = await UserGame
    //         .query(trx)
    //         .where('game_id', game.id)
    //         .fetch();

    //     console.log('members toJSON', members.toJSON());

    //     result = {
    //         success: 1,
    //     };

    //     await trx.commit();

    //     this.socket.emit('newGame', camelize(result));
    //     this.socket.broadcastToAll('members', camelize(members));
    // }

    async onClose() {
        const user = await User.findBy('token', this.token);
        const game = await Game.findBy('nice_id', this.roomId);

        const userGame = await UserGame.findBy({ user_id: user.id, game_id: game.id });

        if (userGame) {
            await userGame.delete();
        }

        console.log('Closing subscription for room topic', this.socket.topic);

        return this.sendFullData();
    }
}

module.exports = GameController;
