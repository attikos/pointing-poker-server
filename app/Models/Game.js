const { generateNiceId } = require('../../utils/random-string');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Game extends Model {
    static boot() {
        super.boot();

        this.addHook('beforeCreate', (gameInstance) => {
            gameInstance.nice_id = generateNiceId();
        });
    }

    // members() {
    //     return this
    //         .belongsToMany('App/Models/UserGame')
    //         .pivotTable('user_game');
    // }
}

module.exports = Game;
