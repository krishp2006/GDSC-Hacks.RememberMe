// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Grab all .page sections and nav links for navigation
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('nav ul li a');
    const apiUrl = 'http://localhost:5000'; // Adjust to match your backend host if deployed

    // Handle navigation between pages
    function navigateTo(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            loadPageData(pageId); // Load relevant content for the selected page
        } else {
            document.getElementById('home').classList.add('active');
        }
    }

    // Attach click listeners to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const pageId = link.getAttribute('href').substring(1);
            navigateTo(pageId);
            window.location.hash = pageId; // Optional: update URL hash
        });
    });

    // Load initial page based on URL hash or default to 'home'
    const initialPageId = window.location.hash.substring(1) || 'home';
    navigateTo(initialPageId);

    // --- Fetch Utilities (GET and POST requests) ---

    // Reusable GET fetch helper
    async function fetchData(endpoint) {
        try {
            const response = await fetch(`${apiUrl}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            alert(`Failed to load from ${endpoint}`);
            return [];
        }
    }

    // Reusable POST fetch helper
    async function postData(endpoint, data) {
        try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP ${response.status} - ${errorData.message}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`POST to ${endpoint} failed:`, error);
            alert(`Failed to save to ${endpoint}`);
            return null;
        }
    }

    // --- Home Page Content ---

    const memoryHighlightContent = document.getElementById('memory-highlight-content');
    const refreshMemoryBtn = document.getElementById('refresh-memory-btn');
    const upcomingEventsList = document.getElementById('upcoming-events-list');

    // Load a random memory highlight using the backend
    async function loadMemoryHighlight() {
        if (!memoryHighlightContent) return;
        memoryHighlightContent.textContent = 'Loading a memory highlight...';
        // You forgot to actually call fetchData — needs to be uncommented
        const data = await fetchData('/getRandomMemoryHighlight');
        memoryHighlightContent.textContent = data?.highlight || 'Could not load a memory.';
    }

    // Load and display upcoming events
    async function loadUpcomingEvents() {
        if (!upcomingEventsList) return;
        upcomingEventsList.innerHTML = '<p>Loading events...</p>';
        const events = await fetchData('/events/upcoming');
        if (events.length > 0) {
            upcomingEventsList.innerHTML = '';
            events.forEach(event => {
                const div = document.createElement('div');
                div.className = 'event-summary-item';
                const date = new Date(event.eventDate);
                const formatted = date.toLocaleDateString(undefined, {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                });
                div.innerHTML = `<strong>${event.eventName}</strong> – ${formatted}`;
                upcomingEventsList.appendChild(div);
            });
        } else {
            upcomingEventsList.innerHTML = '<p>No upcoming events.</p>';
        }
    }

    // Refresh memory button click event
    if (refreshMemoryBtn) {
        refreshMemoryBtn.addEventListener('click', loadMemoryHighlight);
    }

    // --- Events Management ---

    const eventForm = document.getElementById('event-form');
    const eventsListDisplay = document.getElementById('events-list');
    const eventNameInput = document.getElementById('eventName');
    const eventDateInput = document.getElementById('eventDate');
    const eventDescriptionInput = document.getElementById('eventDescription');

    // Load all events for the Events page
    async function loadEvents() {
        const events = await fetchData('/events');
        displayEvents(events);
    }

    // Display list of events
    function displayEvents(events) {
        eventsListDisplay.innerHTML = '<h3>Scheduled Events</h3>';
        if (events.length === 0) {
            eventsListDisplay.innerHTML += '<p>No events yet.</p>';
            return;
        }
        events.forEach(event => {
            const div = document.createElement('div');
            div.className = 'event-card';
            const date = new Date(event.eventDate);
            const formatted = date.toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            div.innerHTML = `
                <strong>${event.eventName}</strong> – ${formatted}
                ${event.eventDescription ? `<p>${event.eventDescription}</p>` : ''}
            `;
            eventsListDisplay.appendChild(div);
        });
    }

    // Event form submission handler
    eventForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newEvent = {
            eventName: eventNameInput.value.trim(),
            eventDate: eventDateInput.value,
            eventDescription: eventDescriptionInput.value.trim()
        };
        if (newEvent.eventName && newEvent.eventDate) {
            const added = await postData('/events', newEvent);
            if (added) {
                loadEvents();
                loadUpcomingEvents();
                eventForm.reset();
            }
        } else {
            alert('Event name and date are required.');
        }
    });

    // --- Family Tree ---

    const familyForm = document.getElementById('family-form');
    const familyTreeDisplay = document.getElementById('family-tree-display');
    const familyNameInput = document.getElementById('familyName');
    const familyRelationshipInput = document.getElementById('familyRelationship');

    // Load all family members
    async function loadFamilyTree() {
        const members = await fetchData('/familyTree');
        familyTreeDisplay.innerHTML = '<h3>Family Members</h3>';
        if (members.length === 0) {
            familyTreeDisplay.innerHTML += '<p>No family members yet.</p>';
            return;
        }
        const list = document.createElement('ul');
        members.forEach(member => {
            const item = document.createElement('li');
            item.className = 'family-member-card';
            item.textContent = `${member.personName} (${member.relationship})`;
            list.appendChild(item);
        });
        familyTreeDisplay.appendChild(list);
    }

    // Family form submit handler
    familyForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newMember = {
            personName: familyNameInput.value.trim(),
            relationship: familyRelationshipInput.value.trim()
        };
        if (newMember.personName && newMember.relationship) {
            const added = await postData('/familyTree', newMember);
            if (added) {
                loadFamilyTree();
                familyNameInput.value = '';
                familyRelationshipInput.value = '';
            }
        } else {
            alert('Please enter name and relationship.');
        }
    });

    // --- Memories Section ---

    const memoryForm = document.getElementById('memory-form');
    const memoriesListDisplay = document.getElementById('memories-list');
    const memoryPersonNameInput = document.getElementById('memoryPersonName');
    const memoryRelationshipInput = document.getElementById('memoryRelationship');
    const memoryTextInput = document.getElementById('memoryText');
    const memoryTagsInput = document.getElementById('memoryTags');

    // Load memories from backend
    async function loadMemories() {
        const memories = await fetchData('/memory');
        displayMemories(memories);
    }

    // Display all loaded memories
    function displayMemories(memories) {
        memoriesListDisplay.innerHTML = '<h3>Memories</h3>';
        if (memories.length === 0) {
            memoriesListDisplay.innerHTML += '<p>No memories added yet.</p>';
            return;
        }
        memories.forEach(memory => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.innerHTML = `
                <strong>${memory.personName} (${memory.relationship})</strong>
                <p>${memory.memoryText}</p>
                ${memory.tags?.length ? `<p><em>Tags: ${memory.tags.join(', ')}</em></p>` : ''}
            `;
            memoriesListDisplay.appendChild(card);
        });
    }

    // Memory form submit handler
    memoryForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const tags = memoryTagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
        const newMemory = {
            personName: memoryPersonNameInput.value.trim(),
            relationship: memoryRelationshipInput.value.trim(),
            memoryText: memoryTextInput.value.trim(),
            tags
        };
        if (newMemory.personName && newMemory.relationship && newMemory.memoryText) {
            const added = await postData('/memory', newMemory);
            if (added) {
                loadMemories();
                memoryForm.reset();
            }
        } else {
            alert('Please fill all required fields.');
        }
    });

    // --- Patient Info Section ---

    const patientInfoForm = document.getElementById('patient-info-form');
    const patientInfoDisplay = document.getElementById('patient-info-display');

    // Load patient info
    async function loadPatientInfo() {
        const infoArr = await fetchData('/patientInfo');
        const info = infoArr[0];
        if (info) {
            displayPatientInfo(info);
        } else {
            patientInfoDisplay.innerHTML = '<p>No patient info entered yet.</p>';
        }
    }

    // Render patient info in the UI
    function displayPatientInfo(info) {
        patientInfoDisplay.innerHTML = `
            <div><strong>Name:</strong> ${info.name || 'N/A'}</div>
            <div><strong>Age:</strong> ${info.age || 'N/A'}</div>
            <div><strong>Activities:</strong> ${(info.favoriteActivities || []).join(', ')}</div>
            <div><strong>Life Events:</strong> ${(info.notableLifeEvents || []).join(', ')}</div>
            <div><strong>Hobbies:</strong> ${(info.hobbies || []).join(', ')}</div>
            <div><strong>Medical Notes:</strong> ${info.medicalNotes || 'N/A'}</div>
        `;
    }

    // Handle patient info form submission
    patientInfoForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const data = {
            name: document.getElementById('patientName').value,
            age: parseInt(document.getElementById('patientAge').value),
            favoriteActivities: document.getElementById('patientActivities').value.split(',').map(s => s.trim()),
            notableLifeEvents: document.getElementById('patientEvents').value.split(',').map(s => s.trim()),
            hobbies: document.getElementById('patientHobbies').value.split(',').map(s => s.trim()),
            medicalNotes: document.getElementById('patientMedicalNotes').value.trim()
        };
        const result = await postData('/patientInfo', data);
        if (result) {
            alert('Patient info saved.');
            loadPatientInfo();
        }
    });

    // --- Page Loader Dispatcher ---

    // Called when a page is activated to load its content
    function loadPageData(pageId) {
        switch (pageId) {
            case 'home':
                loadMemoryHighlight();
                loadUpcomingEvents();
                break;
            case 'events':
                loadEvents();
                break;
            case 'family-tree':
                loadFamilyTree();
                break;
            case 'memories':
                loadMemories();
                break;
            case 'patient-info':
                loadPatientInfo();
                break;
        }
    }
});
