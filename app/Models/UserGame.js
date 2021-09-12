/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class UserGame extends Model {
    // user() {
    //     return this.hasMany('App/Models/User');
    // }

    // game() {
    //     return this.hasOne('App/Models/Game');
    // }
}

module.exports = UserGame;
