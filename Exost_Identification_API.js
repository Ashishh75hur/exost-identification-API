// save as imagePingServer.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const app = express();
const PORT = 3000;

app.use(cors());

const ENDPOINT = 'https://plant-solution.onrender.com/identify';
const REQUEST_COUNT = 100;
const CYCLE_DELAY_MS = 15 * 1000;
const IMAGE_PATH = './unnamed.jpg';

let isRunning = false;

async function sendRequests() {
    for (let i = 0; i < REQUEST_COUNT; i++) {
        const form = new FormData();
        form.append('image', fs.createReadStream(IMAGE_PATH));

        axios.post(ENDPOINT, form, {
            headers: form.getHeaders(),
        }).catch(() => {});
    }

    setTimeout(() => {
        if (isRunning) {
            axios.get(`https://exost-identification-api.onrender.com/start`).catch(() => {});
        }
    }, CYCLE_DELAY_MS);
}

app.get('/start', (req, res) => {
    if (!isRunning) {
        isRunning = true;
    }
    sendRequests();
    res.json({ message: 'Loop started.' });
});

app.get('/stop', (req, res) => {
    isRunning = false;
    res.json({ message: 'Loop stopped.' });
});

app.listen(PORT);
