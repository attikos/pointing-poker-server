const _ = require('lodash');
const { camelize, decamelize } = require('../../../utils/camelize');
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

        this.userConnected();
    }

    async userConnected() {
        console.log('userConnected');

        try {
            const game = await this.getGame();
            const user = await this.getUser();

            this.game = game;
            this.user = user;

            let userGame = await UserGame.findBy({
                user_id: this.user.id,
                game_id: this.game.id,
            });

            if (!userGame && this.user && this.game) {
                userGame = await UserGame.create({
                    user_id: this.user.id,
                    game_id: this.game.id,
                });
                await userGame.save();
            }
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
            .groupBy('users.id')
            .orderBy('users.id');
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
            .select('user_scores.*')
            .from('issues')
            .leftJoin('user_scores', 'issues.id', 'user_scores.issue_id')
            .where('issues.game_id', game_id)
            .where('issues.status', '!=', 'processing')
            .groupBy('user_scores.id')
            .orderBy('user_scores.id');

        result.issues = await Database
            .select('*')
            .from('issues')
            .where('game_id', game_id)
            .groupBy('issues.id')
            .orderBy('issues.id');

        result.usersScores = {};
        result.scores.forEach((score) => {
            if (result.usersScores[score.user_id]) {
                result.usersScores[score.user_id].push(score);
            } else {
                result.usersScores[score.user_id] = [score];
            }
        });

        result.members = await this.getMembers(game_id);

        return result;
    }

    async sendFullData() {
        const result = await this.getAllData() || {};
        const user = await this.getUser(true);

        if (!result) {
            return;
        }

        this.socket.broadcastToAll('all-data', camelize(result));
        this.socket.emit('user', camelize(user));
    }

    async broadcastFullData() {
        const result = await this.getAllData() || {};
        const user = await this.getUser(true);

        if (!result) {
            return;
        }

        await this.socket.broadcast('all-data', camelize(result));
        await this.socket.emit('user', camelize(user));
    }

    onGetAllData() {
        this.sendFullData();
    }

    // async onGetUser() {
    //     const result = await this.getUser(true);

    //     if (!result) {
    //         return;
    //     }

    //     this.socket.emit('user', camelize(result));
    // }

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

    async onleaveGame() {
        this.onClose();
    }

    async onStopGame() {
        const game = await this.getGame();
        const user = await this.getUser();

        if (game.user_id !== user.id) {
            return false;
        }

        if (game.status === 'lobby') {
            // await Message.query().where('game_id', game.id).delete();
            await Issue.query().where('game_id', game.id).delete();
            await UserGame.query().where('game_id', game.id).delete();
            await game.delete();
            return this.socket.broadcastToAll('close');
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

        const issue = await Issue.findBy({ game_id: game.id, is_current: true });

        if (issue && issue.status === 'processing') {
            return false;
        }

        await UserScore
            .query()
            .where('issue_id', issue.id)
            .delete();

        issue.status = 'processing';
        await issue.save();

        return this.sendFullData();
    }

    async onStopRound() {
        const game = await this.getGame();
        const user = await this.getUser();

        if (game.user_id !== user.id) {
            return false;
        }

        const issue = await Issue.findBy({ game_id: game.id, is_current: true, status: 'processing' });

        if (!issue) {
            return false;
        }

        const userScore = await UserScore.findBy('issue_id', issue.id);

        issue.status = userScore ? 'finished' : 'new';
        await issue.save();

        return this.sendFullData();
    }

    async onSetIssueAsCurrent(data) {
        const params = _.pick(decamelize(data), [
            'flag',
            'issue_id',
        ]);

        const game = await this.getGame();
        const user = await this.getUser();

        if (game.user_id !== user.id) {
            return false;
        }

        if (!params.issue_id) {
            return false;
        }

        const issue = await Issue.findBy('id', params.issue_id);

        if (issue.game_id !== game.id) {
            return false;
        }

        if (!issue) {
            return false;
        }

        await Issue
            .query()
            .where('game_id', game.id)
            .where('is_current', true)
            .update({ is_current: false });

        await issue.reload();
        issue.is_current = params.flag === undefined ? true : params.flag;
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
        const userGame = await UserGame.findBy({ user_id: player.id, game_id: game.id });

        if (userGame) {
            try {
                await userGame.delete();
                await this.broadcastFullData();
                return this.socket.broadcastToAll('user-dropped', player.nice_id);
            } catch (error) {
                console.log(error);
            }
        }

        return false;
    }

    async onAddScore(score) {
        const game = await this.getGame();
        const user = await this.getUser();
        const issue = await Issue.findBy({
            is_current: true,
            game_id: game.id,
        });

        if (!issue || !score) {
            return false;
        }

        let userScore = await UserScore.findBy({
            issue_id: issue.id,
            user_id: user.id,
        });

        if (!userScore) {
            userScore = await UserScore.create({
                issue_id: issue.id,
                user_id: user.id,
                score,
            });
        } else {
            userScore.score = score;
        }

        if (userScore.status === 'finished') {
            console.log('add score not available, because it has status is finished');
            return false;
        }

        const userCount = await Database
            .select('users.*')
            .from('users')
            .leftJoin('user_games', 'users.id', 'user_games.user_id')
            .where('user_games.game_id', game.id)
            .where('users.is_observer', false)
            .groupBy('users.id')
            .getCount();

        const scoreCount = await UserScore
            .query()
            .where('issue_id', issue.id)
            .getCount();

        if (userCount <= scoreCount) {
            console.log('set finished issue id:', issue.id);
            issue.status = 'finished';
        }

        await issue.save();

        // Get all users in game which no observer and no voited
        await this.socket.emit('my-score', userScore);
        return this.sendFullData();
    }

    async onAddIssue(form = {}) {
        const game = await this.getGame();
        const user = await this.getUser();

        if (game.user_id !== user.id) {
            return false;
        }

        const formPicked = _.pick(decamelize(form), [
            'title',
            'link',
            'is_current',
            'priority',
            'status',
            'id',
        ]);

        if (formPicked.id) {
            const issue = await Issue.findBy('id', formPicked.id);

            if (issue && issue.game_id === game.id) {
                await issue.fill(formPicked);
                await issue.save();
            }
        } else {
            const issueParams = { ...formPicked, game_id: game.id };

            try {
                const issue = await Issue.create(issueParams);
                await issue.save();
            } catch (error) {
                console.error(error);
                this.socket.emit('error', { addIssue: error });
                return false;
            }
        }

        return this.sendFullData();
    }

    async onDeleteIssue(issueId) {
        const game = await this.getGame();
        const user = await this.getUser();

        if (game.user_id !== user.id) {
            return false;
        }

        const issue = await Issue.findBy('id', issueId);

        if (issue && issue.game_id === game.id) {
            await issue.delete();
        }

        return this.sendFullData();
    }

    async onSetAsObserver(flag) {
        const user = await this.getUser();

        if (!user) {
            return false;
        }

        user.is_observer = !!flag;
        await user.save();

        return this.sendFullData();
    }

    async dillerExitGame() {
        const user = await User.findBy('token', this.token);
        const game = await Game.findBy('nice_id', this.roomId);

        const userGame = await UserGame.findBy({ user_id: user.id, game_id: game.id });

        if (userGame) {
            console.log('Drop the game by dillerExitGame: ', game.nice_id);
            await userGame.delete();
        }

        console.log('Diller was left game', this.socket.topic);

        return this.sendFullData();
    }

    async onClose() {
        const user = await User.findBy('token', this.token);
        const game = await Game.findBy('nice_id', this.roomId);

        const userGame = await UserGame.findBy({ user_id: user.id, game_id: game.id });

        if (userGame) {
            console.log('Drop the user from game: ', game.nice_id);
            await userGame.delete();
        }

        console.log('Closing subscription for room topic', this.socket.topic);

        await this.socket.emit('close');
        return this.sendFullData();
    }
}

module.exports = GameController;
