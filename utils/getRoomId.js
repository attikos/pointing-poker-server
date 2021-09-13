// eslint-disable-next-line arrow-body-style
const getRoomId = (topic = '') => {
    return topic.match(/^(room:)(\w{6})/)[2];
};

module.exports = {
    getRoomId,
};
