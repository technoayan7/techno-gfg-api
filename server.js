const express = require('express');
const { Scrap } = require('./modules/scrap');

const app = express();

app.get('/:username', async (req, res) => {
    const username = req.params.username;
    const scrapInstance = new Scrap(username);
    const responseData = await scrapInstance.fetchResponse();

    res.json(responseData);
});

module.exports = app;
