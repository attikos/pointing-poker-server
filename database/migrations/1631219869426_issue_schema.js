'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class IssueSchema extends Schema {
	up () {
		this.create('issue', (table) => {
			table.increments()
			table.integer('game_id').references('id').inTable('game')
			table.boolean('is_current').defaultTo(false)
			table.string('title', 512).notNullable()
			table.string('link', 512)
			table.enu('priority', ['low', 'middle', 'high'], { useNative: true, existingType: true, enumName: 'issue_priority_type' }).defaultTo('middle')
			table.timestamps()
		})
	}

	down () {
		this.drop('issue')
	}
}

module.exports = IssueSchema
