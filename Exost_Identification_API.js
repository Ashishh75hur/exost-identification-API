// save this file as requestLoop.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// endpoint
const ENDPOINT = 'https://plant-solution.onrender.com/identify';

// number of requests per cycle
const REQUEST_COUNT = 100;

// delay between cycles (15 seconds in milliseconds)
const CYCLE_DELAY_MS = 15 * 1000;

// local file path to upload
const IMAGE_PATH = './unnamed.jpg';   // make sure this file exists

async function sendRequests() {
    console.log(`Starting new cycle of ${REQUEST_COUNT} requests...`);

    const requests = [];

    for (let i = 0; i < REQUEST_COUNT; i++) {
        // create fresh form-data for each request
        const form = new FormData();
        form.append('image', fs.createReadStream(IMAGE_PATH));

        requests.push(
            axios.post(ENDPOINT, form, {
                headers: form.getHeaders()
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

    console.log(`Completed ${REQUEST_COUNT} requests, waiting 15 seconds before next cycle...`);
}

async function run() {
    while (true) {
        await sendRequests();
        await new Promise(resolve => setTimeout(resolve, CYCLE_DELAY_MS));
    }
}

run();
