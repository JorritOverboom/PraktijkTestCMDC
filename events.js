// Imports the events.json file.
const events = require('./events.json');

// Converts a date to days.
const convertToDays = (date) => {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const days = date / oneDayInMilliseconds;
    return days;
}

// Converts numeric degrees to radians.
function toRad(Value) 
{
    return Value * Math.PI / 180;
}

// This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km).
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

// Calculate the differences in days between two events.
const daysDifference = (date1, date2) => {
    const day1 = Math.floor(convertToDays(new Date(date1)));
    const day2 = Math.floor(convertToDays(new Date(date2)));
    // console.log(day1);
    // console.log(day2);
    let difference = day1 - day2;
    // console.log(difference);
    if (difference < 0) {
        difference = difference * -1;
    } 
    return difference;
}

// Seperates the true from false live events into a seperate variable.
const liveEvents = events.filter((event) => event.live === true);

// Array for all the events that are within 7 days of the event.
let checkLocation = [];

// Variable to remember which index was last used in the previous iteration.
let lastIndex = 1;

// Array for memorizing which events have their distances already calculated.
const calculatedEvents = [];

// Preparing the calculatedEvents array for calculated events to be pushed into the array.
liveEvents.forEach((event) => {
    calculatedEvents.push(
        {
            event: event,
            closeEvents: [],
            distantEvents: [],
        }
    )
})

// Comparing each event to other events to check whether they happen within 7 days and within 25km of the event 
liveEvents.forEach((event, index) => {
    // console.log(``);
    // console.log(`-----------------------------------------------------------------------------------`);
    // console.log(``);
    // console.log(`Checking event:`);
    // console.log(event);
    const date1 = event.datetime;

    if (index === 1) {
        if (daysDifference(liveEvents[1].datetime, liveEvents[0].datetime) < 8) {
            checkLocation.unshift(liveEvents[0]);
        }
    }

    // This loop will check the first event in the checkLocation array whether it is within 7 days of the current event being checked. If it is not, it will be removed from the array, and the next index will be checked. This will continue until the first event within the checkLocation array, which is in 7 days of the current event, is found.
    // console.log(`Checking the days before the event`)
    for (let i = 0; i < checkLocation.length;) {
        const date2 = checkLocation[i].datetime;
        const differenceInDays = daysDifference(date1, date2);
        // console.log(`The difference between ${event.title} and ${checkLocation[i].title} is ${differenceInDays} days`)
        if (differenceInDays > 7) {
            checkLocation.shift();
            // const shifted = checkLocation.shift();
            // console.log(`${shifted.title} was shifted`);
        } else {
            // console.log(`done checking the days before`)
            break;
        }
    }

    // This loop will check the last event in the checkLocation array whether it is within 7 days of the current event being checked. If it is, it will check the next event in the liveEvents array, by making use of the lastIndex variable, which remembers where to search in the list, and push that event into the checkLocation array if it is within 7 days. This will continue until an event within the liveEvents array, which is longer than 7 days removed of the current event, is found.
    // console.log(`Checking the days after the event`)
    for (let i = lastIndex; i < liveEvents.length; i++) {
        const date2 = liveEvents[i].datetime;
        const differenceInDays = daysDifference(date1, date2);
        if (differenceInDays < 8) {
            checkLocation.push(liveEvents[i]);
            // console.log(`${liveEvents[i].title} was pushed`);
            lastIndex++;
        } else {
            // console.log(`done checking the days after`)
            break;
        }
    }
    // console.log(`The current state of the list is:`)
    // console.log(checkLocation);

    // This loop will check each event within the checkLocation array for its distance compared to the current event being checked and push that event into the calculatedEvents array when calculated.
    for (let i = 0; i < checkLocation.length; i++) {
        // This will skip an iteration if the current event being checked is the same as the event in the checkLocation array.
        if (event.title === checkLocation[i].title) {
            continue;
        }

        // Checking the closeEvents array if the calculation has already been made.
        const existingCloseEventPair = calculatedEvents[index].closeEvents.find((event) => {
            return event.title === checkLocation[i].title;
        });

        // Checking the distantEvents array if the calculation has already been made.
        const existingDistantEventPair = calculatedEvents[index].distantEvents.find((event) => {
            return event.title === checkLocation[i].title;
        });

        // This will skip an iteration if existingCloseEventPair or existingDistantEventPair is existent.
        if (existingCloseEventPair || existingDistantEventPair) {
            // console.log(`Distance between ${event.title} and ${checkLocation[i].title} has already been calculated. Skipping the calculation...`);
            continue; // Skip this iteration
        }

        // Calculating the distance between two events.
        const distance = calcCrow(event.location.lat, event.location.lon, checkLocation[i].location.lat, checkLocation[i].location.lon);
        // console.log(`The distance between ${event.title} and ${checkLocation[i].title} is ${distance} km`);

         // Find the index of the event in the calculatedEvents array that corresponds to checkLocation event.
        const correspondingEventIndex = calculatedEvents.findIndex((calculatedEvent) => calculatedEvent.event.title === checkLocation[i].title);

        // If the distance between events is within 25km of each other, both events will have the other event pushed in the closeEvents property array of the calculatedEvents array. If not, they will be pushed in the distantEvents property array of the calculatedEvents array.
        if (distance < 25) {
            // console.log(`Pushing ${checkLocation[i].title} into the closeEvents property array of ${calculatedEvents[index].title}`);
            if (correspondingEventIndex !== -1) {
                calculatedEvents[index].closeEvents.push(checkLocation[i]);
                // console.log(`Pushing ${event.title} into the closeEvents property array of ${calculatedEvents[correspondingEventIndex].title}`);
                calculatedEvents[correspondingEventIndex].closeEvents.push(event);
            }
        } else {
            // console.log(`Pushing ${checkLocation[i].title} into the distantEvents property array of ${calculatedEvents[index].title}`);
            if (correspondingEventIndex !== -1) {
                calculatedEvents[index].distantEvents.push(checkLocation[i]);
                // console.log(`Pushing ${event.title} into the closeEvents property array of ${calculatedEvents[correspondingEventIndex].title}`);
                calculatedEvents[correspondingEventIndex].distantEvents.push(event);
            }
        }
    }
})

// Loggin the output
console.log(`These are the events that are close to each other:`);
calculatedEvents.forEach((event) => {
    if (event.closeEvents.length > 0) {
        console.log(`----------------------------------------------------------------`);
        console.log(``);
        console.log(`Close locations around ${event.event.title} within 25km and within 7 days:`)
        console.log(event.closeEvents);
        console.log(``);
    } else {
        console.log(`----------------------------------------------------------------`);
        console.log(``);
        console.log(`There are no events within 25km and within 7 days of ${event.event.title}.`);
        // console.log(`Events faraway from ${event.event.title}:`)
        // console.log(event.distantEvents);
        console.log(``);
    }
})


