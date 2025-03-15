document.addEventListener('DOMContentLoaded', function() {
    const calendar = document.getElementById('calendar');
    const todayDetails = document.getElementById('today-details');
    const daysInMarch2025 = 30; // March 2025 has 30 days
    const startDay = 6; // March 1, 2025 is a Saturday
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // Months are zero-based
    const currentYear = today.getFullYear();

    // Retrieve selected values from the backend
    let selectedValues = {};

    // Get your computer's IP address (run 'ifconfig | grep "inet " | grep -v 127.0.0.1' in terminal)
    const API_BASE_URL = 'http://192.168.1.140:5000';

    fetch(`${API_BASE_URL}/get_selections`)
        .then(response => response.json())
        .then(data => {
            data.forEach(selection => {
                selectedValues[`${selection.day}-${selection.item}`] = selection.value;
            });
            fillCalendar();
        })
        .catch(error => {
            console.error('Error fetching selections:', error);
            // Still fill the calendar even if the fetch fails
            fillCalendar();
        });

    // Save selected values to the backend
    function saveSelectedValues(day, item, value) {
        fetch(`${API_BASE_URL}/save_selection`, {  // Changed from http://127.0.0.1:5000
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ day, item, value })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(error => {  // Added error handling
            console.error('Error saving selection:', error);
        });
    }

    // Function to convert number to ordinal form
    function getOrdinal(n) {
        const s = ["th", "st", "nd", "rd"],
              v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    // Function to create the selectable list
    function createSelectableList(day, isToday = false) {
        const container = document.createElement('div');
        const title = isToday ? `Today: T${day}` : `T${day}`; // Shortened "Taraweeh" to "T"
        container.classList.add('selectable-list');
        container.innerHTML = `<h2 class="mobile-title">🌙 ${title}</h2>`;
        for (let j = 1; j <= 10; j++) {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.textContent = `${getOrdinal(j)}: `;
            const select = document.createElement('select');
            
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-';
            select.appendChild(defaultOption);

            ['Abdul Kader','Basith mama','Irshad mama','Ismail mama','Muaadh','Muavvid','Muhyideen mama','Muqsith','Other','Sadak mama','Sulthan'].forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });

            // Restore the selected value if it exists
            if (selectedValues[`${day}-${j}`]) {
                select.value = selectedValues[`${day}-${j}`];
            } else {
                select.value = ''; // Set default option if none selected
            }

            // Save the selected value and update today's details if necessary
            select.addEventListener('change', function() {
                selectedValues[`${day}-${j}`] = select.value;
                saveSelectedValues(day, j, select.value);
                if (isToday) {
                    updateTodayDetails(day);
                }
            });

            itemDiv.appendChild(select);
            container.appendChild(itemDiv);
        }
        return container;
    }

    // Function to update today's details
    function updateTodayDetails(day) {
        todayDetails.innerHTML = '';
        todayDetails.appendChild(createSelectableList(day, true));
    }

    // Function to fill the calendar
    function fillCalendar() {
        for (let day = 1; day <= daysInMarch2025; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day');
            dayCell.textContent = day;

            // Position the first day correctly
            if (day === 1) {
                dayCell.style.gridColumnStart = startDay + 1;
            }

            // Highlight the current date and show today's details
            if (day === currentDay && currentMonth === 3 && currentYear === 2025) {
                dayCell.classList.add('today');
                updateTodayDetails(day);
            }

            // Add click event to open a blank div with 10 items
            dayCell.addEventListener('click', function() {
                const blankDiv = document.createElement('div');
                blankDiv.classList.add('blank-div');
                blankDiv.appendChild(createSelectableList(day, day === currentDay && currentMonth === 3 && currentYear === 2025));
                document.body.appendChild(blankDiv);

                // Add animation
                setTimeout(() => {
                    blankDiv.classList.add('visible');
                }, 10);

                // Prevent the blank div from closing when clicked
                blankDiv.addEventListener('click', function(event) {
                    event.stopPropagation();
                });

                // Close the blank div when clicked outside
                setTimeout(() => {
                    document.addEventListener('click', function(event) {
                        if (!blankDiv.contains(event.target)) {
                            blankDiv.classList.remove('visible');
                            setTimeout(() => {
                                document.body.removeChild(blankDiv);
                            }, 300);
                        }
                    }, { once: true });
                }, 20); // Slight delay before attaching the event listener
            });

            dayCell.addEventListener('touchend', function(e) {
                e.preventDefault();  // Prevent double-firing on mobile
                const blankDiv = document.createElement('div');
                blankDiv.classList.add('blank-div');
                blankDiv.appendChild(createSelectableList(day, day === currentDay && currentMonth === 3 && currentYear === 2025));
                document.body.appendChild(blankDiv);

                // Add animation
                setTimeout(() => {
                    blankDiv.classList.add('visible');
                }, 10);

                // Prevent the blank div from closing when clicked
                blankDiv.addEventListener('click', function(event) {
                    event.stopPropagation();
                });

                // Close the blank div when clicked outside
                setTimeout(() => {
                    document.addEventListener('click', function(event) {
                        if (!blankDiv.contains(event.target)) {
                            blankDiv.classList.remove('visible');
                            setTimeout(() => {
                                document.body.removeChild(blankDiv);
                            }, 300);
                        }
                    }, { once: true });
                }, 20); // Slight delay before attaching the event listener
            });

            calendar.appendChild(dayCell);
        }
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        // Adjust any mobile-specific behaviors
        console.log('Mobile device detected');
    }
});