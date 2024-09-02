document.addEventListener('DOMContentLoaded', function() {
    const SHEET_ID = '1fTzvrBsRQMY_X-dYt-mpjDYv3S2AzYkzybEWkt4lXMI';
    const SHEET_NAME = 'Sheet1';
    const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const events = data.values.slice(1).map(row => ({
                date: row[0],
                time: row[1],
                location: row[2],
                description: row[3],
                isPast: new Date(row[0]) < new Date()
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
