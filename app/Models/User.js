const { generateNiceId } = require('../../utils/random-string');

const { validateAll } = use('Validator');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class User extends Model {
    static boot() {
        super.boot();

        /**
         * A hook to hash the user nice_id before saving
         * it to the database.
         */
        this.addHook('beforeSave', async (userInstance) => {
            const niceId = generateNiceId();

            userInstance.nice_id = niceId;
        });
    }

    static async validate(form) {
        // return false; // TODO
        // let {
        //     token,
        //     first_name,
        //     last_name,
        //     is_diller,
        //     is_player,
        //     game_nice_id,
        // } = form

        const rules = {
            first_name: 'required|alpha',
        };

        const messages = {
            first_name: 'Wrong first name',
        };

        let validation = await validateAll(form, rules, messages);

        if (validation.fails()) {
            return validation.messages();
        }

        return false;
    }

    prepared() {
        const user = {};

        user.name = this.email;
        user.id = this.id;
        user.nice_id = this.nice_id;
        user.token = this.token;

        return user;
    }

//   /**
//    * A relationship on tokens is required for auth to
//    * work. Since features like `refreshTokens` or
//    * `rememberToken` will be saved inside the
//    * tokens table.
//    *
//    * @method tokens
//    *
//    * @return {Object}
//    */
//   tokens () {
//     return this.hasMany('App/Models/Token')
//   }
}

module.exports = User;
