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

let isRunning = false; // flag to control start/stop

async function sendRequests() {
 

    const requests = [];

    for (let i = 0; i < REQUEST_COUNT; i++) {
        const form = new FormData();
        form.append('image', fs.createReadStream(IMAGE_PATH));

        requests.push(
            axios.post(ENDPOINT, form, {
                headers: form.getHeaders(),
            })
        );
    }


    // wait 15 sec, then hit /start again if isRunning is still true
    console.log(`⏳ Waiting 15 sec before checking for next cycle...`);

    setTimeout(async () => {
        if (isRunning) {
            try {
                const response = await axios.get(`https://exost-identification-api.onrender.com/start`);
                
            } catch (err) {
                console.error(`❌ Error self-calling /start:`, err.message);
            }
        } else {
            console.log(`🛑 Loop stopped. Not self-calling /start anymore.`);
        }
    }, CYCLE_DELAY_MS);
}

// GET /start to trigger the loop
app.get('/start', (req, res) => {
    if (!isRunning) {
        isRunning = true;
        sendRequests();
        res.json({ message: 'Loop started.' });
    } else {
        sendRequests();
        res.json({ message: 'Loop already running.' });
    }
});

// GET /stop to stop the loop
app.get('/stop', (req, res) => {
    isRunning = false;
    console.log(`🛑 /stop triggered at ${new Date().toLocaleTimeString()}`);
    res.json({ message: 'Loop stopped.' });
});

// run server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
