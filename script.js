document.addEventListener('DOMContentLoaded', function() {
    // Placeholder for event data
    // This will be replaced with actual JSON fetching later
    const events = [
        { date: '2024-03-15', title: 'Bitcoin-keskusteluilta', description: 'Keskustelua Bitcoinin skaalautuvuudesta', isPast: false },
        { date: '2024-04-01', title: 'Lightning Network -työpaja', description: 'Käytännön harjoituksia Lightning Networkin käytöstä', isPast: false },
        { date: '2024-02-01', title: 'Bitcoin halving -tapahtuma', description: 'Keskustelua lähestyvästä Bitcoin-puolittumisesta', isPast: true }
    ];

    const upcomingList = document.getElementById('upcoming-events-list');
    const pastList = document.getElementById('past-events-list');

    events.forEach(event => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${event.date}</strong> - ${event.title}: ${event.description}`;
        
        if (event.isPast) {
            pastList.appendChild(li);
        } else {
            upcomingList.appendChild(li);
        }
    });
});
