'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterUserAddNiceIdSchema extends Schema {
    up () {
        this.table('user', (table) => {
            table.string('nice_id', 6).notNullable().unique().index()
        })
    }

    down () {
        this.table('user', (table) => {
            table.dropColumn('nice_id')
        })
    }
}

module.exports = AlterUserAddNiceIdSchema
