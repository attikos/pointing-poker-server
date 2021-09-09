'use strict'

const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(6, UIDGenerator.BASE36);

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Game extends Model {
    static boot () {
        super.boot()

        this.addHook('beforeSave', async (gameInstance) => {
            gameInstance.nice_id = uidgen.generateSync();
        })
    }
}

module.exports = Game
