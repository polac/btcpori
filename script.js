document.addEventListener('DOMContentLoaded', function() {
    const SHEET_ID = '1fTzvrBsRQMY_X-dYt-mpjDYv3S2AzYkzybEWkt4lXMI';
    const EVENTS_SHEET_NAME = 'Sheet1';
    const ABOUT_SHEET_NAME = 'Taulukko2';

    const eventsUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${EVENTS_SHEET_NAME}`;
    const aboutUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${ABOUT_SHEET_NAME}`;

    // Add loading indicators
    addLoadingIndicator('events', 'Ladataan tapahtumia...');
    addLoadingIndicator('about', 'Ladataan tietoja...');

    // Fetch events data
    fetch(eventsUrl)
        .then(response => response.text())
        .then(data => {
            const jsonData = JSON.parse(data.substring(47).slice(0, -2));
            handleEventsResponse(jsonData);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            handleError('events');
        });

    // Fetch about data
    fetch(aboutUrl)
        .then(response => response.text())
        .then(data => {
            const jsonData = JSON.parse(data.substring(47).slice(0, -2));
            handleAboutResponse(jsonData);
        })
        .catch(error => {
            console.error('Error fetching about info:', error);
            handleError('about');
        });

    // Set up modal close functionality
    const modal = document.getElementById('share-modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});

function addLoadingIndicator(sectionId, text) {
    const loadingIndicator = document.createElement('p');
    loadingIndicator.textContent = text;
    loadingIndicator.id = `loading-indicator-${sectionId}`;
    document.getElementById(sectionId).appendChild(loadingIndicator);
}

function handleEventsResponse(response) {
    const jsonData = response.table;
    console.log('Received data:', jsonData); // Debug log
    
    const events = jsonData.rows.map(row => {
        console.log('Processing row:', row); // Debug log
        
        // Check if row data exists and has the expected structure
        if (!row || !row.c || !row.c[0] || !row.c[0].v) {
            console.warn('Invalid row data:', row);
            return null;
        }
        
        try {
            const dateParts = row.c[0].v.match(/\d+/g).map(Number);
            const date = new Date(dateParts[0], dateParts[1], dateParts[2]);
            const now = new Date();
            now.setHours(0, 0, 0, 0);  // Set to start of today
            
            return {
                date: date,
                time: row.c[1] && row.c[1].f ? row.c[1].f.replace('klo ', '') : '',
                location: row.c[2] && row.c[2].v ? row.c[2].v : '',
                description: row.c[3] && row.c[3].v ? row.c[3].v : '',
                isPast: date < now
            };
        } catch (error) {
            console.error('Error processing row:', error, row);
            return null;
        }
    }).filter(event => event !== null); // Remove any null events

    const upcomingList = document.getElementById('upcoming-events-list');
    const pastList = document.getElementById('past-events-list');

    // Clear existing events
    upcomingList.innerHTML = '';
    pastList.innerHTML = '';

    if (events.length === 0) {
        const noEvents = document.createElement('li');
        noEvents.textContent = 'Ei tapahtumia tällä hetkellä';
        upcomingList.appendChild(noEvents);
        return;
    }

    // Separate past and upcoming events
    const pastEvents = events.filter(event => event.isPast);
    const upcomingEvents = events.filter(event => !event.isPast);
    
    // Sort past events from latest to oldest (descending by date)
    pastEvents.sort((a, b) => b.date - a.date);
    
    // Sort upcoming events from earliest to latest (ascending by date)
    upcomingEvents.sort((a, b) => a.date - b.date);
    
    // Add upcoming events to the list
    upcomingEvents.forEach(event => {
        const li = document.createElement('li');
        li.innerHTML = createEventListItem(event, true);
        upcomingList.appendChild(li);
    });
    
    // Add past events to the list (already sorted latest to oldest)
    pastEvents.forEach(event => {
        const li = document.createElement('li');
        li.innerHTML = createEventListItem(event, false);
        pastList.appendChild(li);
    });

    removeLoadingIndicator('events');

    // Display a message if there are no events
    if (events.length === 0) {
        const noEventsMessage = document.createElement('p');
        noEventsMessage.textContent = 'Ei tapahtumia tällä hetkellä.';
        document.getElementById('events').appendChild(noEventsMessage);
    }
}

function handleAboutResponse(response) {
    const jsonData = response.table;
    const aboutContent = jsonData.rows[0].c[0].v;
    document.getElementById('about-content').innerHTML = aboutContent;
    removeLoadingIndicator('about');
}

function handleError(sectionId) {
    console.error(`Error fetching ${sectionId} data`);
    const errorMessage = document.createElement('p');
    errorMessage.textContent = `${sectionId === 'events' ? 'Tapahtumien' : 'Tietojen'} lataaminen epäonnistui. Yritä myöhemmin uudelleen.`;
    errorMessage.style.color = 'red';
    document.getElementById(sectionId).appendChild(errorMessage);
    removeLoadingIndicator(sectionId);
}

function removeLoadingIndicator(sectionId) {
    const loadingIndicator = document.getElementById(`loading-indicator-${sectionId}`);
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

function createEventListItem(event, showShareIcons = true) {
    const formattedDate = event.date.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' });
    let eventHtml = `
        <strong>${formattedDate} ${event.time}</strong> - ${event.location}
        <p>${event.description}</p>
    `;
    
    if (showShareIcons) {
        eventHtml += `
        <div class="share-icons">
            <i class="fab fa-facebook share-icon" onclick="shareEvent('facebook', '${formattedDate}', '${event.time}', '${event.location}', '${event.description}')" title="Jaa Facebookissa"></i>
            <i class="fab fa-twitter share-icon" onclick="shareEvent('twitter', '${formattedDate}', '${event.time}', '${event.location}', '${event.description}')" title="Jaa Twitterissä"></i>
            <i class="fab fa-linkedin share-icon" onclick="shareEvent('linkedin', '${formattedDate}', '${event.time}', '${event.location}', '${event.description}')" title="Jaa LinkedInissä"></i>
            <i class="fab fa-whatsapp share-icon" onclick="shareEvent('whatsapp', '${formattedDate}', '${event.time}', '${event.location}', '${event.description}')" title="Jaa WhatsAppissa"></i>
            <i class="fas fa-link share-icon" onclick="copyEventLink('${formattedDate}', '${event.time}', '${event.location}', '${event.description}')" title="Kopioi linkki"></i>
        </div>
        `;
    }
    
    return eventHtml;
}

function shareEvent(platform, date, time, location, description) {
    const eventText = `BTC Pori tapahtuma: ${date} ${time} - ${location}. ${description}`;
    const encodedText = encodeURIComponent(eventText);
    const currentUrl = encodeURIComponent(window.location.href);

    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${encodedText}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=BTC%20Pori%20Tapahtuma&summary=${encodedText}`,
        whatsapp: `https://wa.me/?text=${encodedText}`
    };

    const shareUrl = shareUrls[platform];
    if (shareUrl) {
        window.open(shareUrl, '_blank');
    }
}

function copyEventLink(date, time, location, description) {
    const eventText = `BTC Pori tapahtuma: ${date} ${time} - ${location}. ${description}`;
    const tempInput = document.createElement('input');
    tempInput.value = eventText;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Tapahtuman tiedot kopioitu leikepöydälle!');
}
