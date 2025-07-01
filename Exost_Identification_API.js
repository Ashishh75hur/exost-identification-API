const express = require('express');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const app = express();
const PORT = 3000;

const ENDPOINT = 'https://plant-solution.onrender.com/identify';
const REQUEST_COUNT = 100;
const CYCLE_DELAY_MS = 15 * 1000;
const IMAGE_PATH = './unnamed.jpg';

let isRunning = false; // flag to control start/stop

async function sendRequests() {
    console.log(`🚀 Starting new cycle of ${REQUEST_COUNT} requests...`);

    const requests = [];

    for (let i = 0; i < REQUEST_COUNT; i++) {
        const form = new FormData();
        form.append('image', fs.createReadStream(IMAGE_PATH));

        requests.push(
            axios.post(ENDPOINT, form, {
                headers: form.getHeaders(),
            })
                .then((response) => {
                    console.log(`Request ${i + 1} status: ${response.status}`);
                })
                .catch((error) => {
                    console.error(`Request ${i + 1} error:`, error.message);
                })
        );
    }

    await Promise.all(requests);

    console.log(`✅ Completed ${REQUEST_COUNT} requests.`);

    // wait 15 sec, then hit /start again if isRunning is still true
    console.log(`⏳ Waiting 15 sec before checking for next cycle...`);

    setTimeout(async () => {
        if (isRunning) {
            try {
                const response = await axios.get(`http://localhost:${PORT}/start`);
                console.log(`🔁 Self-called /start - status: ${response.status}`);
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
        console.log(`🟢 /start triggered at ${new Date().toLocaleTimeString()}`);
        sendRequests();
        res.json({ message: 'Loop started.' });
    } else {
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
