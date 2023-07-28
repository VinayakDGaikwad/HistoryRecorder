function addNewEvents() {

    let x = document.getElementById("populating")
    let popDBMessage = document.createElement("div")
    popDBMessage.innerHTML = "Populating DB..."
    x.appendChild(popDBMessage)


    // Get the current date and time
    const currentDate = new Date();

    // Get the time in milliseconds from the date object
    const epochTimeInMilliseconds = currentDate.getTime();

    // Convert 2 minutes to milliseconds
    const twoMinutesInMilliseconds = 2 * 60 * 1000;

    // Subtract 2 minutes in milliseconds from the epoch time
    const newEpochTimeInMilliseconds = epochTimeInMilliseconds - twoMinutesInMilliseconds;

    // Create a new date object using the resulting epoch time
    const newDate = new Date(newEpochTimeInMilliseconds);

    chrome.history.search({ text: "", startTime: newDate.getTime(), maxResults: 2147483647 }, function (listOfURLs) {
        for (let i = 0; i < listOfURLs.length; i++) {

            let title = listOfURLs[i].title
            title.replace(/[^\w\s.-]/gi, '');
            title.replace(/\s+/g, ' ');
            
            sendEntry(title);
            console.log(title);

        }
    })
}

function sendEntry(text) {
    const url = 'http://localhost:3000/' + text;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            
            // Do something with the data from the server
        })
        .catch(error => {
            
        });
}

function startLoop() {

    // Set the interval to 2 minutes (120 seconds)
    const intervalInMilliseconds = 1 * 1000;

    // Start the loop
    const loop = setInterval(addNewEvents, intervalInMilliseconds);
}

window.onload = function () {
    document.getElementById("populate").addEventListener("click", chrome.runtime.sendMessage({ action: 'wakeUpServiceWorker' }))
};