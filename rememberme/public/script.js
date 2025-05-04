document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('nav ul li a');
    const apiUrl = 'http://localhost:5000'; // Assuming backend runs on port 5000
    const homePage = document.getElementById('home');    

    // --- Navigation ---
    function navigateTo(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            // Load data for the activated page
            loadPageData(pageId);

        } else {
            // Default to home if pageId is invalid
            document.getElementById('home').classList.add('active');
        }
    }

    navLinks.forEach( link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const pageId = link.getAttribute('href').substring(1);
            navigateTo(pageId);
            // Update URL hash for history/bookmarking (optional)
            window.location.hash = pageId;
        });
    });

    // Handle initial page load based on hash or default to home
    const initialPageId = window.location.hash.substring(1) || 'home';
    navigateTo(initialPageId);

    // --- Home Page: Tabbed Person Selection and Story Generation ---
    const personTabsDiv = document.createElement('div');
    personTabsDiv.id = 'person-tabs';
    const storyDisplayDiv = document.createElement('div');
    storyDisplayDiv.id = 'generated-story';
    storyDisplayDiv.style.marginTop = '20px';

    if (homePage) {
        homePage.appendChild(personTabsDiv);
        
        homePage.appendChild(storyDisplayDiv);
    }

    async function createPersonTabs() {
        const familyMembers = await fetchData('/familyTree'); // Fetch family tree data
        if (familyMembers.length === 0) {
            personTabsDiv.innerHTML = '<p>No family members added yet. Add some in the Family Tree page!</p>';
            return;

        }

        const tabsList = document.createElement('ul');
        tabsList.classList.add('tabs'); // Add a class for styling

        familyMembers.forEach(member => {
            const tabItem = document.createElement('li');
            tabItem.textContent = member.personName;
            tabItem.addEventListener('click', () => generateStoryForPerson(member.personName));
            tabsList.appendChild(tabItem);
        });

        personTabsDiv.appendChild(tabsList);
    }

   

    // --- API Fetch Functions ---
    async function fetchData(endpoint) {
        try {
            const response = await fetch(`${apiUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            alert(`Failed to load data from ${endpoint}. Please ensure the backend server is running.`);
            return []; // Return empty array on error. This is good behaviour
        }
    }

    async function postData(endpoint, data) {
        try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error posting to ${endpoint}:`, error);
            alert(`Failed to save data to ${endpoint}. Error: ${error.message}`);
            return null;
        }
    }

     async function putData(endpoint, data) {
        try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error putting to ${endpoint}:`, error);
            alert(`Failed to update data at ${endpoint}. Error: ${error.message}`);
            return null;
        }
    }

     async function deleteData(endpoint) {
        try {
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
            }
             // Check if response has content before parsing JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return await response.json();
            } else {
                return { message: 'Deleted successfully' }; // Or handle empty response appropriately
            }
        } catch (error) {
            console.error(`Error deleting from ${endpoint}:`, error);
            alert(`Failed to delete data from ${endpoint}. Error: ${error.message}`);
            return null;
        }
    }    

    // --- Data Loading and Display ---
    function loadPageData(pageId) {
        switch (pageId) {
            case 'family-tree':
                loadFamilyTree();
                break;
            case 'memories':
                loadMemories(); // Also used initially for stored stories
                break;
            case 'stored-stories':
                loadStoredStories();
                break;
            case 'patient-info':
                loadPatientInfo();
                break;
             case 'home':
                createPersonTabs()
                break;
            // Add cases for other pages if needed
        }
    }

    // Family Tree
    const familyForm = document.getElementById('family-form');
    const familyTreeDisplay = document.getElementById('family-tree-display');
    const familyNameInput = document.getElementById('familyName');
    const familyRelationshipInput = document.getElementById('familyRelationship');

    async function loadFamilyTree() {
        const familyMembers = await fetchData('/familyTree');
        displayFamilyTree(familyMembers);
    }

    function displayFamilyTree(members) {
        familyTreeDisplay.innerHTML = '<h3>Family Members</h3>'; // Fix: Corrected tag
        if (members.length === 0) {
            familyTreeDisplay.innerHTML += '<p>No family members added yet.</p>'; // Fix: Corrected tag
            return; // Fix: Added return statement to exit the function early
        }
        // Basic list display for now, visualization is more complex
        const list = document.createElement('ul');
        members.forEach(member => {
            const item = document.createElement('li');
            item.className = 'family-member-card'; // Apply card style
            item.textContent = `${member.personName} (${member.relationship})`;
            list.appendChild(item);
        });
        familyTreeDisplay.appendChild(list);
    }

    familyForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newMember = {
            personName: familyNameInput.value.trim(),
            relationship: familyRelationshipInput.value.trim()
        };
        if (newMember.personName && newMember.relationship) {
            const addedMember = await postData('/familyTree', newMember);
            if (addedMember) {
                loadFamilyTree(); // Refresh display
                familyNameInput.value = '';
                familyRelationshipInput.value = '';
            }
        } else {
            alert('Please enter both name and relationship.');
        }
    });

    // Memories
    const memoryForm = document.getElementById('memory-form');
    const memoriesListDisplay = document.getElementById('memories-list');
    const memoryPersonNameInput = document.getElementById('memoryPersonName');
    const memoryRelationshipInput = document.getElementById('memoryRelationship');
    const memoryTextInput = document.getElementById('memoryText');
    const memoryTagsInput = document.getElementById('memoryTags');
    let editingMemoryId = null; // To track if we are editing

    async function loadMemories() {
        const memories = await fetchData('/memory');
        // Clear editing state when reloading memories
        editingMemoryId = null;
        memoryForm.querySelector('button[type="submit"]').textContent = 'Add Memory';
        displayMemories(memories, memoriesListDisplay); // Display in the "Add Memory" page's list
    }

    function displayMemories(memories, displayElement) {
         displayElement.innerHTML = '<h3>Recent Memories</h3>'; // Fix: Corrected tag
        if (memories.length === 0) {
            displayElement.innerHTML += '<p>No memories added yet.</p>'; // Fix: Corrected tag
            return;
        }
        memories.forEach(memory => {
            const item = document.createElement('div'); // Fix: Corrected tag
            item.className = 'memory-card'; // Apply card style
            item.innerHTML = `
                <strong>${memory.personName} (${memory.relationship})</strong>
                <p>${memory.memoryText}</p>                
                ${memory.tags && memory.tags.length > 0 ? `<p><em>Tags: ${memory.tags.join(', ')}</em></p>` : ''}
                <button onclick="editMemory('${memory._id}')">Edit</button>
                <button onclick="deleteMemory('${memory._id}')">Delete</button>
            `;
            displayElement.appendChild(item);
        });
    }

     memoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const tags = memoryTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag); // Split, trim, remove empty
        const newMemory = {
            personName: memoryPersonNameInput.value.trim(),
            relationship: memoryRelationshipInput.value.trim(),
            memoryText: memoryTextInput.value.trim(),
            tags: tags
        };

        if (newMemory.personName && newMemory.relationship && newMemory.memoryText) {
            const addedMemory = await postData('/memory', newMemory);
             if (addedMemory) {
                loadMemories(); // Refresh display
                memoryPersonNameInput.value = '';
                memoryRelationshipInput.value = '';
                memoryTextInput.value = '';
                memoryTagsInput.value = '';
            }
        } else {
             alert('Please fill in Name, Relationship, and Memory text.');
        }
    });

    // Stored Stories (Memories Display & Filtering)
    const storiesDisplay = document.getElementById('stories-display');
    const filterTagInput = document.getElementById('filterTag');
    const filterRelationshipInput = document.getElementById('filterRelationship');
    const searchKeywordInput = document.getElementById('searchKeyword');

    let allMemoriesCache = []; // Cache memories for filtering

    async function loadStoredStories() {
        allMemoriesCache = await fetchData('/memory');
        displayFilteredMemories(allMemoriesCache); // Initially display all
    }

    function displayFilteredMemories(memories) {
        storiesDisplay.innerHTML = '<h3>All Memories</h3>'; // Fix: Corrected tag
        if (memories.length === 0) {
            storiesDisplay.innerHTML += '<p>No memories found.</p>'; // Fix: Corrected tag
           return;
        }
        memories.forEach(memory => {
            const item = document.createElement('div');
            item.className = 'story-card'; // Apply card style
             item.innerHTML = `
                <strong>${memory.personName} (${memory.relationship})</strong> - <small>${new Date(memory.createdAt || Date.now()).toLocaleDateString()}</small>
                <p>${memory.memoryText}</p>
                ${memory.tags && memory.tags.length > 0 ? `<p><em>Tags: ${memory.tags.join(', ')}</em></p>` : ''}
                <button onclick="exportSingleMemory('${memory._id}')">Export PDF</button>
            `; // Note: Added createdAt assumption, might need adjustment based on actual model/data
            storiesDisplay.appendChild(item);
        });
    }

    window.filterAndSearchMemories = function() { // Make function global for onclick
        const tagFilter = filterTagInput.value.trim().toLowerCase();
        const relationshipFilter = filterRelationshipInput.value.trim().toLowerCase();
        const keywordFilter = searchKeywordInput.value.trim().toLowerCase();

        const filtered = allMemoriesCache.filter(memory => {
            const matchesTag = !tagFilter || (memory.tags && memory.tags.some(tag => tag.toLowerCase().includes(tagFilter)));
            const matchesRelationship = !relationshipFilter || memory.relationship.toLowerCase().includes(relationshipFilter);
            const matchesKeyword = !keywordFilter ||
                memory.personName.toLowerCase().includes(keywordFilter) ||
                memory.relationship.toLowerCase().includes(keywordFilter) ||
                memory.memoryText.toLowerCase().includes(keywordFilter) ||
                (memory.tags && memory.tags.some(tag => tag.toLowerCase().includes(keywordFilter)));

            return matchesTag && matchesRelationship && matchesKeyword;
        });

        displayFilteredMemories(filtered);
    }

    // Patient Info
    const patientInfoForm = document.getElementById('patient-info-form');
    const patientInfoDisplay = document.getElementById('patient-info-display');
    const patientNameInput = document.getElementById('patientName');
    const patientAgeInput = document.getElementById('patientAge');
    const patientActivitiesInput = document.getElementById('patientActivities');
    const patientEventsInput = document.getElementById('patientEvents');
    const patientHobbiesInput = document.getElementById('patientHobbies');
    const patientMedicalNotesInput = document.getElementById('patientMedicalNotes');
    let currentPatientInfoId = null; // To store the ID for updates

    async function loadPatientInfo() {
        const infoArray = await fetchData('/patientInfo');
        // Assuming only one patient's info is stored for simplicity
        if (infoArray.length > 0) {
            const info = infoArray[0];
            displayPatientInfo(info);
            // Populate form for editing
            patientNameInput.value = info.name || '';
            patientAgeInput.value = info.age || '';
            patientActivitiesInput.value = (info.favoriteActivities || []).join(', ');
            patientEventsInput.value = (info.notableLifeEvents || []).join(', ');
            patientHobbiesInput.value = (info.hobbies || []).join(', ');
            patientMedicalNotesInput.value = info.medicalNotes || '';
            currentPatientInfoId = info._id; // Store ID for update
        } else {
            patientInfoDisplay.innerHTML = '<p>No patient information entered yet.</p>';
            currentPatientInfoId = null; // Reset ID
             // Clear form if no data
            patientInfoForm.reset();
        }
    }

        function displayPatientInfo(info) {
        patientInfoDisplay.innerHTML = '<h3>Current Information</h3>'; // Fix: Corrected tag
        if (!info) {
            patientInfoDisplay.innerHTML += '<p>No information available.</p>'; // Fix: Corrected tag
           return;
        }
        patientInfoDisplay.innerHTML = '<h3>Current Information</h3>';
        if (!info) {
             patientInfoDisplay.innerHTML += '<p>No information available.</p>';
             return;
        }
        patientInfoDisplay.innerHTML += `
            <div class="info-item"><strong>Name:</strong> ${info.name || 'N/A'}</div>
            <div class="info-item"><strong>Age:</strong> ${info.age || 'N/A'}</div>
            <div class="info-item"><strong>Favorite Activities:</strong> ${(info.favoriteActivities || []).join(', ') || 'N/A'}</div>
            <div class="info-item"><strong>Notable Life Events:</strong> ${(info.notableLifeEvents || []).join(', ') || 'N/A'}</div>
            <div class="info-item"><strong>Hobbies:</strong> ${(info.hobbies || []).join(', ') || 'N/A'}</div>
            <div class="info-item"><strong>Medical Notes:</strong> ${info.medicalNotes || 'N/A'}</div>
        `;
    }

    patientInfoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const patientData = {
            name: patientNameInput.value.trim(),
            age: patientAgeInput.value ? parseInt(patientAgeInput.value, 10) : null,
            favoriteActivities: patientActivitiesInput.value.split(',').map(s => s.trim()).filter(s => s),
            notableLifeEvents: patientEventsInput.value.split(',').map(s => s.trim()).filter(s => s),
            hobbies: patientHobbiesInput.value.split(',').map(s => s.trim()).filter(s => s),
            medicalNotes: patientMedicalNotesInput.value.trim()
        };

        if (!patientData.name) {
            alert('Patient name is required.');
            return;
        }

        // Use the POST endpoint which now handles upsert
        const result = await postData('/patientInfo', patientData);

        if (result) {
            loadPatientInfo(); // Refresh display and form
            alert('Patient information saved successfully!');
        }
    });

    // --- Story Generation for a Specific Person ---
    async function generateStoryForPerson(personName) {
        const storyDiv = document.getElementById('generated-story');
        if (!storyDiv) {
            console.error('Story display div not found!');
            return;
        }

        storyDiv.innerHTML = `<p>Generating a story about ${personName}...</p>`;

        try {
            const memories = await fetchData('/memory');
            const relevantMemories = memories.filter(memory => memory.personName === personName);

            if (relevantMemories.length === 0) {
                storyDiv.innerHTML = `<p>No memories found for ${personName}.</p>`;
                return;
            }

            const memoryTexts = relevantMemories.map(memory => `${memory.relationship}: ${memory.memoryText}`);
            const prompt = `A story about ${personName} based on these memories:`;

            // Enhanced Prompt - more specific
            //const prompt = `Tell me a heartwarming story about ${personName}, focusing on their relationships and key memories:`;
            //const prompt = `Imagine you are telling a story about ${personName} to a close friend.  What would you share based on these memories?`;            

             // Send to backend for story generation
             const result = await postData('/generateStory', { prompt, memories: memoryTexts });

             if (result && result.story) {
                 storyDiv.innerHTML = `
                     <h4>Story about ${personName}</h4>
                     <p>${result.story}</p>
                 `;
             } else {
                 storyDiv.innerHTML = `<p>Failed to generate a story about ${personName}.</p>`;
             }

            // You can try other prompts to guide the story generation in different directions.
        } catch (error) {
            console.error('Error generating story:', error);
            storyDiv.innerHTML = '<p>Failed to generate a story due to an error.</p>';
        }
    }


    // --- Initial Load ---
    //if (homePage && tellMeAboutThemButton) {
    //    generateStoryForPerson(); // Optionally generate a story on initial load
    //}


    // --- Placeholder Functions for Edit/Delete/Export ---
    // --- Edit/Delete/Export Functions ---

    window.editMemory = async function(memoryId) {
        console.log(`Editing memory: ${memoryId}`);
        // 1. Fetch the specific memory data
        const memoryToEdit = await fetchData(`/memory/${memoryId}`);
        if (!memoryToEdit) {
            alert('Could not load memory data for editing.');
            return;
        }

        // 2. Populate the memory form
        memoryPersonNameInput.value = memoryToEdit.personName;
        memoryRelationshipInput.value = memoryToEdit.relationship;
        memoryTextInput.value = memoryToEdit.memoryText;
        memoryTagsInput.value = (memoryToEdit.tags || []).join(', ');

        // 3. Set editing state and change button text
        editingMemoryId = memoryId;
        memoryForm.querySelector('button[type="submit"]').textContent = 'Update Memory';

        // 4. Navigate to the memories page/form
        navigateTo('memories');
        memoryPersonNameInput.focus(); // Focus on the first field
    }

    window.deleteMemory = async function(memoryId) {
        if (confirm('Are you sure you want to delete this memory?')) {
            const result = await deleteData(`/memory/${memoryId}`);
            if (result) {
                loadMemories(); // Refresh list on the Memories page
                loadStoredStories(); // Refresh list on the Stored Stories page
                alert(result.message || 'Memory deleted successfully.');
            }
        }
    }

     window.exportMemories = function() {
        alert('Export All as PDF functionality is not implemented. Requires a PDF generation library (client-side or server-side).');
        // Implementation would involve libraries like jsPDF (client) or Puppeteer (server).
    }

    window.exportSingleMemory = function(memoryId) {
         alert(`Export Single Memory PDF for ${memoryId} is not implemented.`);
         // Similar to export all, but targets a specific memory.
    }

}); // End DOMContentLoaded