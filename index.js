const express = require('express');
const { Scrap } = require('./modules/scrap');

const app = express();
const port = 9000; 

app.get('/:username', async (req, res) => {
    const username = req.params.username;
    const scrapInstance = new Scrap(username);
    const responseData = await scrapInstance.fetchResponse();

    res.json(responseData);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
