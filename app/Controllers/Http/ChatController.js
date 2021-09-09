'use strict'

const Database = use('Database')
const Message = use('App/Models/Message')

class GameController {
    async post({request, response, auth}) {
        const { content, type } = request.input('message');
        const message           = new Message()
        const user              = await auth.getUser()

        message.user_id = user.id || 0;
        message.type    = type;
        message.content = content;

        try {
            await message.save()
        } catch (error) {
            console.log('error', error);

            return response.json({ success: 0, error: 'SYSTEM_ERROR' })
        }

        return response.json({ success: 1 });
    }

    async list({request, response, auth}) {
        const limit = request.input('limit') || 15;

        const messages = await Database
            .select(
                'messages.user_id as participantId',
                'messages.content as content',
                'messages.created_at as timestamp',
                'messages.type as type',
                'messages.uploaded as uploaded',
                'messages.viewed as viewed',
                'messages.id as id',
            )
            .from('messages')
            .orderBy('id', 'desc')
            .limit(limit)

        messages.sort( (a,b) => a.id < b.id ? -1 : 1 )

        const participantsList = await Database
            .table('messages')
            .select('user_id')
            .groupBy('user_id')

        // const participantsIdList = Array.from( new Set( [ ...messages.map( x => x.participantId ) ] ) );

        const participantsIdList = participantsList.map( x => x.user_id )

        const participants = await Database
            .select(
                'users.id as id',
                'users.email as name',
            )
            .from('users')
            .whereIn('id', participantsIdList)

        return response.json({
            success: 1,
            messages,
            participants,
        })
    }
}

module.exports = GameController
