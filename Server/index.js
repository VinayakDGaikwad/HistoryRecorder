/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable camelcase */
// [START calendar_quickstart]
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
var calendar;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const http = require('http');
const port = 3000;

const server = http.createServer((req, res) => {
  // Extract information from the request object
  const method = req.method;
  const url = req.url;
  const headers = req.headers;
  const userAgent = headers['user-agent'];

  // Log the request information
  console.log(`${url}`);

  createEvent(`${url}`);  // Respond to the request
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, this is your Node.js server!');
});

server.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
});



/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * 
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth) {

  calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }
  console.log('Upcoming 10 events loaded!');
  events.map((event, i) => {
    const start = event.start.dateTime || event.start.date;
    //console.log(`${start} - ${event.summary}`);
  });
}

authorize().then(listEvents).catch(console.error);
// [END calendar_quickstart]

function createEvent(text) {
  // Get the current date and time
  const currentDate = new Date();

  // Format the current date and time in RFC3339 format
  const currentRFC3339Date = formatDateToRFC3339(currentDate);

  // Increment the date by 10 minutes
  const incrementedDate = new Date(currentDate.getTime() + 10 * 60000); // 10 minutes in milliseconds

  // Format the incremented date in RFC3339 format
  const incrementedRFC3339Date = formatDateToRFC3339(incrementedDate);

  text = text.replace("/", '');
  try {
     calendar.events.insert({
    calendarId: 'primary', // The ID of the calendar you want to add the event to (use 'primary' for the primary calendar)
    resource: {
      summary: text.replace(/%20/g, ' '), // Event title
      description: 'This is a new event created using the Google Calendar API.', // Event description (optional)
      start: {
        dateTime: currentRFC3339Date, // Start date and time of the event (in RFC3339 format)
        timeZone: 'IST', // Time zone for the event (e.g., 'America/New_York')
      },
      end: {
        dateTime: incrementedRFC3339Date, // End date and time of the event (in RFC3339 format)
        timeZone: 'IST', // Time zone for the event (e.g., 'America/New_York')
      },
    }
  });
  } catch (error) {
    console.log("Missed some sites!")
  }
 
}

// Function to format the date in RFC3339 format
function formatDateToRFC3339(date) {
  function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

  return (
    date.getUTCFullYear() +
    '-' +
    pad(date.getUTCMonth() + 1) +
    '-' +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    ':' +
    pad(date.getUTCMinutes()) +
    ':' +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}


