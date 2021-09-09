'use strict'

const Message = use('App/Models/Message')

async function saveMessage({ data, auth }) {
    const { content, type } = data;
    const message           = new Message()
    const user              = await auth.getUser()

    message.user_id  = user.id || 0;
    message.type     = type;
    message.content  = content;
    message.uploaded = true;

    try {
        await message.save()
    } catch (error) {
        console.log('error', error);

        return { error: 'SYSTEM_ERROR' }
    }

    return message;
}

class GameController {
    constructor ({ socket, request, auth }) {
        this.socket  = socket
        this.request = request
        this.auth    = auth;

        console.log('auth token', auth.token);
    }

    async onMessage (data) {
        const message = await saveMessage({data, auth: this.auth});

        message.participantId = message.user_id;

        this.socket.broadcastToAll('message', message)
    }

    async onViewed (messageIdList) {
        await Message
            .query()
            .whereIn('id', messageIdList)
            .andWhere('viewed', false)
            .update({ viewed: true })

        this.socket.broadcastToAll('viewed', messageIdList)
    }

}

module.exports = GameController
