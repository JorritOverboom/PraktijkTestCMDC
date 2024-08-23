// Imports the events.json file
const events = require('./events.json');

// Converts a date to days
const convertToDays = (date) => {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const days = date / oneDayInMilliseconds;
    return days;
}

// Converts numeric degrees to radians
function toRad(Value) 
{
    return Value * Math.PI / 180;
}

// This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) 
{
    const R = 6371; // km
    const dLat = toRad(lat2-lat1);
    const dLon = toRad(lon2-lon1);
    const latitude1 = toRad(lat1);
    const latitude2 = toRad(lat2);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(latitude1) * Math.cos(latitude2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c;
    return d;
}

// Seperates the true from false live events into a seperate variable
const liveEvents = events.filter((event) => event.live === true);

// For loop for checking each individual object within the lifeEvents variable
for (let i = 0; i < liveEvents.length; i++) {
    let date1 = new Date(liveEvents[i].datetime);
    let days1 = Math.floor(convertToDays(date1));
    let daysDifference = 0;
    let checkLocation = [];
    let closeEvents = [];
    
    // Checking for events happening within a maximum of 7 days before the current event
    for (let j = i - 1; daysDifference < 8; j--) {
        if (j < 0) {
            break;
        }
        let date2 = new Date(liveEvents[j].datetime);
        let days2 = Math.floor(convertToDays(date2));
        daysDifference = days1 - days2;
        if (daysDifference > 7) {
            break;
        }
        checkLocation.push(liveEvents[j]);
    }

    // Resetting the daysDifference
    daysDifference = 0;

    // Checking for events happening within a maximum of 7 days after the current event
    for (let j = i + 1; daysDifference < 8; j++) {
        if (j >= liveEvents.length) {
            break;
        }
        let date2 = new Date(liveEvents[j].datetime);
        let days2 = Math.floor(convertToDays(date2));
        let daysDifference = days2 - days1;
        if (daysDifference > 7) {
            break;
        }
        checkLocation.push(liveEvents[j]);
    }

    // Comparing each event within the checkLocation array to the current event. Every event within 25km will be pushed into the closeEvents array
    checkLocation.forEach((event) => {
        const distance = calcCrow(liveEvents[i].location.lat, liveEvents[i].location.lon, event.location.lat, event.location.lon);
        if (distance < 25) {
            // console.log(`The distance between ${liveEvents[i].title} and ${event.title} is ${distance}`);
            closeEvents.push(event);
        }
    })

    // Console log output for no matches
    if (closeEvents.length === 0) {
        console.log(`There are no events within 25km and within 7 days of ${liveEvents[i].title}.`);
    }

    // Console log output for matches
    if (closeEvents.length > 0) {
        console.log(`Close locations around ${liveEvents[i].title} within 25km and within 7 days:`);
        console.log(closeEvents);
    }


}





