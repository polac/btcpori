document.addEventListener('DOMContentLoaded', function() {
    const SHEET_ID = '1fTzvrBsRQMY_X-dYt-mpjDYv3S2AzYkzybEWkt4lXMI';
    const SHEET_NAME = 'Sheet1';

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

    // Add loading indicator
    const loadingIndicator = document.createElement('p');
    loadingIndicator.textContent = 'Ladataan tapahtumia...';
    loadingIndicator.id = 'loading-indicator';
    document.getElementById('events').appendChild(loadingIndicator);

    fetch(url)
        .then(response => response.text())
        .then(data => {
            // Extract the JSON from the JSONP response
            const jsonData = JSON.parse(data.substring(47).slice(0, -2));
            handleResponse(jsonData);
        })
        .catch(error => {
            console.error('Error:', error);
            handleError();
        });
});

function handleResponse(response) {
    const jsonData = response.table;
    
    const events = jsonData.rows.map(row => {
        const dateParts = row.c[0].v.match(/\d+/g).map(Number);
        const date = new Date(dateParts[0], dateParts[1], dateParts[2]);
        return {
            date: date,
            time: row.c[1].f.replace('klo ', ''),
            location: row.c[2].v,
            isPast: date < new Date()
        };
    });

    const upcomingList = document.getElementById('upcoming-events-list');
    const pastList = document.getElementById('past-events-list');

    events.forEach(event => {
        const li = document.createElement('li');
        const formattedDate = event.date.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' });
        li.innerHTML = `<strong>${formattedDate} ${event.time}</strong> - ${event.location}`;
        
        if (event.isPast) {
            pastList.appendChild(li);
        } else {
            upcomingList.appendChild(li);
        }
    });

    // Remove loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }

    // Display a message if there are no events
    if (events.length === 0) {
        const noEventsMessage = document.createElement('p');
        noEventsMessage.textContent = 'Ei tapahtumia tällä hetkellä.';
        document.getElementById('events').appendChild(noEventsMessage);
    }
}

function handleError() {
    console.error('Error fetching events');
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Tapahtumien lataaminen epäonnistui. Yritä myöhemmin uudelleen.';
    errorMessage.style.color = 'red';
    document.getElementById('events').appendChild(errorMessage);

    // Remove loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}
