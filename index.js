const express = require('express');
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { Scrap } = require('./modules/scrap');

const app = express();
const port = 3000; 

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 90,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "Too many request from this IP, try again in 1 hour",
});

app.use(cors()); //enable all CORS request
app.use(limiter); //limit to all API

app.get('/:username', async (req, res) => {
    const username = req.params.username;
    const scrapInstance = new Scrap(username);
    const responseData = await scrapInstance.fetchResponse();

    res.json(responseData);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
