document.addEventListener('DOMContentLoaded', function() {
    const SHEET_ID = '1fTzvrBsRQMY_X-dYt-mpjDYv3S2AzYkzybEWkt4lXMI';
    const SHEET_NAME = 'Sheet1';

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

    fetch(url)
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
        })
        .catch(error => console.error('Error fetching events:', error));
});
