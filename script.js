document.addEventListener('DOMContentLoaded', function() {
    const SHEET_ID = '1fTzvrBsRQMY_X-dYt-mpjDYv3S2AzYkzybEWkt4lXMI';
    const SHEET_NAME = 'Sheet1';

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
    const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';

    fetch(corsProxyUrl + url)
        .then(response => response.text())
        .then(data => {
            // Remove the extra text around the JSON
            const jsonData = JSON.parse(data.substring(47).slice(0, -2));
            
            const events = jsonData.table.rows.map(row => ({
                date: row.c[0].v,
                time: row.c[1].v,
                location: row.c[2].v,
                description: row.c[3].v,
                isPast: new Date(row.c[0].v) < new Date()
            }));

            const upcomingList = document.getElementById('upcoming-events-list');
            const pastList = document.getElementById('past-events-list');

            events.forEach(event => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${event.date} ${event.time}</strong> - ${event.location}: ${event.description}`;
                
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
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Tapahtumien lataaminen epäonnistui. Yritä myöhemmin uudelleen.';
            errorMessage.style.color = 'red';
            document.getElementById('events').appendChild(errorMessage);
        });

    // Add loading indicator
    const loadingIndicator = document.createElement('p');
    loadingIndicator.textContent = 'Ladataan tapahtumia...';
    loadingIndicator.id = 'loading-indicator';
    document.getElementById('events').appendChild(loadingIndicator);
});
