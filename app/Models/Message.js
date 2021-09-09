'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Message extends Model {
    static boot () {
        super.boot()

        this.addHook('beforeSave', async (messageInstance) => {
            if (messageInstance.dirty.content) {
                messageInstance.uploaded = true
            }
        })
    }

    // static formatDates (field, value) {
    //     if (field === 'created_at' || field === 'updated_at') {
    //         return value.format('YYYY-MM-DD')
    //     }

    //     return super.formatDates(field, value)
    // }

    static castDates (field, value) {
        if (field === 'created_at' || field === 'updated_at') {
            return value.format()
        }

        return super.formatDates(field, value)
    }

    // prepared() {
    //     const message = {};

    //     message.content        = this.content
    //     message.id             = this.id
    //     message.created_at     = this.created_at
    //     message.participant_id = this.user_id
    //     message.timestamp      = this.created_at
    //     message.type           = this.type
    //     message.updated_at     = this.updated_at
    //     message.viewed         = this.viewed
    //     message.uploaded       = this.uploaded

    //     return message;
    // }
}

module.exports = Message
