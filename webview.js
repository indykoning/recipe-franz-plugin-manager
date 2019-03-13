'use strict';

const path = require('path');

module.exports = Franz => {

    const getMessages = () => {
        const updates = document.querySelectorAll('.updateform').length;
        Franz.setBadge(updates);
    };

    Franz.loop(getMessages);
};
