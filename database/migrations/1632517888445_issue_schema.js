/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class IssueSchema extends Schema {
    up() {
        this.alter('issues', (table) => {
            table.enu(
                'status',
                ['new', 'processing', 'finished'],
                {
                    useNative: true,
                    existingType: false,
                    enumName: 'issue_status_type',
                },
            ).defaultTo('new');

            table.dropColumn('is_finished');
        });
    }

    down() {
        this.alter('issues', (table) => {
            table.dropColumn('status');
        });

        this.raw('DROP TYPE issue_status_type');

        this.table('issues', (table) => {
            table.boolean('is_finished').defaultTo(false);
        });
    }
}

module.exports = IssueSchema;
