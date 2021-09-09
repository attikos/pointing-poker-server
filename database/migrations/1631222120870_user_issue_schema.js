'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserIssueSchema extends Schema {
    up () {
        this.create('user_issue', (table) => {
            table.increments()
            table.integer('issue_id').notNullable().references('id').inTable('issue')
            table.integer('user_id').notNullable().references('id').inTable('user')
            table.string('score', 3).notNullable()
            table.timestamps()
        })
    }

    down () {
        this.drop('user_issue')
    }
}

module.exports = UserIssueSchema
