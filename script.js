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
    
    const events = jsonData.rows.map(row => {
        const dateParts = row.c[0].v.match(/\d+/g).map(Number);
        const date = new Date(dateParts[0], dateParts[1], dateParts[2]);
        return {
            date: date,
            time: row.c[1].f.replace('klo ', ''),
            location: row.c[2].v,
            description: row.c[3] ? row.c[3].v : '',
            isPast: date < new Date()
        };
    });

    const upcomingList = document.getElementById('upcoming-events-list');
    const pastList = document.getElementById('past-events-list');

    events.forEach(event => {
        const li = document.createElement('li');
        const formattedDate = event.date.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' });
        li.innerHTML = `
            <strong>${formattedDate} ${event.time}</strong> - ${event.location}
            <p>${event.description}</p>
            <div class="share-icons">
                <img src="data/facebook-icon.png" alt="Share on Facebook" class="share-icon" onclick="shareEvent('facebook', '${formattedDate}', '${event.time}', '${event.location}', '${event.description}')">
                <img src="data/twitter-icon.png" alt="Share on Twitter" class="share-icon" onclick="shareEvent('twitter', '${formattedDate}', '${event.time}', '${event.location}', '${event.description}')">
                <img src="data/linkedin-icon.png" alt="Share on LinkedIn" class="share-icon" onclick="shareEvent('linkedin', '${formattedDate}', '${event.time}', '${event.location}', '${event.description}')">
                <img src="data/whatsapp-icon.png" alt="Share on WhatsApp" class="share-icon" onclick="shareEvent('whatsapp', '${formattedDate}', '${event.time}', '${event.location}', '${event.description}')">
            </div>
        `;
        
        if (event.isPast) {
            pastList.appendChild(li);
        } else {
            upcomingList.appendChild(li);
        }
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

function shareEvent(platform, date, time, location, description) {
    const eventText = `BTC Pori tapahtuma: ${date} ${time} - ${location}. ${description}`;
    const encodedText = encodeURIComponent(eventText);
    const currentUrl = encodeURIComponent(window.location.href);

    let shareUrl;

    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${encodedText}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=BTC%20Pori%20Tapahtuma&summary=${encodedText}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodedText}`;
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank');
    }
}
