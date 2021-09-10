'use strict'

const uidgen = new UIDGenerator(8);

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class User extends Model {
    static boot () {
        super.boot()

        /**
         * A hook to hash the user nice_id before saving
         * it to the database.
         */
        this.addHook('beforeSave', async (userInstance) => {
            const nice_id = uidgen.generateSync()

            userInstance.nice_id = nice_id;
        })
    }

    prepared() {
        const user = {};

        user.name    = this.email
        user.id      = this.id
        user.nice_id = this.nice_id
        user.token   = this.token

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

module.exports = User
