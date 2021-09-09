'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class GameSchema extends Schema {
    up () {
        this.create('game', (table) => {
            table.increments()
            table.enu('status', ['new', 'processing', 'finished'], { useNative: true, existingType: true, enumName: 'game_status_type' }).defaultTo('new')
            table.integer('user_id').notNullable().references('id').inTable('user')
            table.string('nice_id', 6).notNullable().unique().index()
            table.timestamps()
        })
    }

    down () {
        this.drop('game')
    }
}

module.exports = GameSchema
