/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserIssueSchema extends Schema {
    up() {
        this.create('user_issues', (table) => {
            table.increments();
            table.integer('issue_id').notNullable().references('id').inTable('issues');
            table.integer('user_id').notNullable().references('id').inTable('users');
            table.string('score', 3).notNullable();
            table.timestamps();
        });
    }

    down() {
        this.drop('user_issues');
    }
}

module.exports = UserIssueSchema;
