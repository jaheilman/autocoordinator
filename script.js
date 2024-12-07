// Initialize variables
let players = [];
// let teamColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#F3FF33'];
let teamColors = [
    '#000000',
    '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#F3FF33', // Original Colors
    '#8E44AD', '#34AADB', '#1ABC9C', '#F39C12', '#D35400', // Additional Colors
    '#C0392B', '#7D3C98', '#2ECC71', '#E74C3C', '#9B59B6', // Bright Contrasts
    '#16A085', '#27AE60', '#2980B9', '#E67E22', '#BDC3C7'  // Soft Pastels
];

// Unassign all players
function unassignAllPlayers() {
    if (confirm("Are you sure you want to unassign all players?")) {
        const unassignedContainer = document.querySelector('[data-team="null"]');
        const allPlayers = document.querySelectorAll('.player');
        allPlayers.forEach(player => {
            unassignedContainer.appendChild(player);
        });
        updateAndSync();
    }
}


// Synchronize the players array with the DOM
function syncPlayers() {
    const allPlayers = document.querySelectorAll('.player');
    players.forEach(player => {
        const playerElement = document.querySelector(`[data-id="${player.id}"]`);
        const teamContainer = playerElement?.parentElement;
        if (teamContainer) {
            player.team = teamContainer.dataset.team === "null" ? null : teamContainer.dataset.team;
        }
    });
}

function syncTeams(players, teams){
    teams.forEach(team => {
        team.maxRosterSize = 11;
        team.team = [];
    })
    players.forEach(player => {
        if (player.coach_kid){
            const team = teams.find(team => team.id === player.coach_kid);
            if (team) {
                player.assignToTeam(player.coach_kid); 
                team.addToTeam(player.id);
            }
        }
        if (player.team != null) {
            const team = teams.find(team => team.id === player.team);
            if (team) {
                team.addToTeam(player.id);
            }
        }
    })
}

function renderTeams(){
    document.getElementById('teamCount'). value = teams.length
    updateTeams();
}

// Update the number of teams dynamically
function updateTeams() {
    const desiredTeams = parseInt(document.getElementById('teamCount').value, 10);
    const currentTeams = document.querySelectorAll('.team-container:not(#unassigned)').length;
    if (desiredTeams > currentTeams) {
        // Add new teams
        for (let i = currentTeams + 1; i <= desiredTeams; i++) {
            addTeam(`${i}`);
        }
    } else if (desiredTeams < currentTeams) {
        // Remove extra teams and reassign players
        for (let i = currentTeams; i > desiredTeams; i--) {
            removeTeam(`${i}`);
        }
    }
    updateCounts();
}

// Add a new team container
function addTeam(teamId) {
    const teamContainer = document.createElement('div');
    teamContainer.classList.add('team-container');
    teamContainer.style.backgroundColor = teamColors[teamId] || '#ccc';
    teamContainer.innerHTML = `
        <h2>Team${teamId}</h2>
        <div class="team-content" data-team="${teamId}"></div>
        <div class="team-counter">0 Players</div>
    `;
    document.getElementById('container').appendChild(teamContainer);
    enableDragAndDrop();
}

// Remove a team and reassign its players to unassigned
function removeTeam(teamId) {
    const teamContainer = document.querySelector(`[data-team="${teamId}"]`);
    if (teamContainer) {
        const unassignedContainer = document.querySelector('[data-team="null"]');
        const playersToReassign = teamContainer.querySelectorAll('.player');
        playersToReassign.forEach(player => unassignedContainer.appendChild(player));
        teamContainer.parentElement.removeChild(teamContainer);
    }
}

// Update team counts
function updateCounts() {
    document.querySelectorAll('.team-container').forEach(container => {
        const count = container.querySelectorAll('.player').length;
        const counter = container.querySelector('.team-counter');
        if (counter) counter.textContent = `${count} Players`;
    });
}

// Enable drag and drop with synchronization
function enableDragAndDrop() {
    const draggables = document.querySelectorAll('.player');
    const containers = document.querySelectorAll('.team-content');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            updateAndSync(); // Update counts and synchronize players
        });
    });

    containers.forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            container.appendChild(dragging);
        });
    });
}

// Export to JSON
function exportData() {
    savePlayersAndTeamsToJson(players, teams, filename = "web_data_export.json")
}


// Update team counts and synchronize players
function updateAndSync() {
    updateCounts();
    syncPlayers();
}


class PlayerTeam {
    constructor(id, name, location) {
        this.id = id;
        this.name = name;
        this.location = location; // [latitude, longitude]
        this.team = null;
        this.friends = [];
        this.distances = [];
        this.rankings = [];
        this.minRosterSize = null;
        this.maxRosterSize = null;
        this.coach_kid = null;
    }

    sortDistances() {
        this.distances.sort((a, b) => a[0] - b[0]);
    }

    addToTeam(teamId) {
        this.team.push(teamId);
    }

    assignToTeam(teamId) {
        this.team = [teamId];
    }

    roomOnTeam() {
        if (this.maxRosterSize === null) {
            return false;
        }
        return this.team.length < this.maxRosterSize;
    }

    // Convert to JSON-compatible object
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            location: this.location,
            team: this.team,
            friends: this.friends,
            distances: this.distances,
            rankings: this.rankings,
            minRosterSize: this.minRosterSize,
            maxRosterSize: this.maxRosterSize,
            coach_kid: this.coach_kid,
        };
    }

    // Create a PlayerTeam instance from JSON-compatible object
    static fromJSON(data) {
        const playerTeam = new PlayerTeam(data.id, data.name, data.location);
        playerTeam.team = data.team;
        playerTeam.friends = data.friends || [];
        playerTeam.distances = data.distances || [];
        playerTeam.rankings = data.rankings || [];
        playerTeam.minRosterSize = data.minRosterSize;
        playerTeam.maxRosterSize = data.maxRosterSize;
        playerTeam.coach_kid = data.coach_kid;
        return playerTeam;
    }
}

function savePlayersAndTeamsToJson(players, teams, filename = "web_data.json") {
    const combinedData = { 
        players: players.map(pt => pt.toJSON()), 
        teams: teams.map(pt => pt.toJSON()) 
    };
    const jsonData = JSON.stringify(combinedData, null, 4);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Import data and render it
async function importData() {
    try {
        const { players: importedPlayers, teams: importedTeams } = await loadPlayerTeamsFromDialog();
        
        // Clear any existing players
        players = importedPlayers;
        teams = importedTeams;
        calculateDistances(players, teams);
        calculateDistances(teams, players);
        syncTeams(players, teams);
        // Re-render the players and teams
        renderTeams(); // Ensure the teams are also re-rendered
        renderPlayers(); // Render the new players with their teams
    } catch (error) {
        console.error("Error loading players and teams:", error);
    }
}
// Function to load the player and team data from a file dialog
function loadPlayerTeamsFromDialog() {
    return new Promise((resolve, reject) => {
        // Create a file input element
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json"; // Restrict to JSON files

        // Handle file selection
        input.addEventListener("change", () => {
            const file = input.files[0];
            if (!file) {
                reject(new Error("No file selected"));
                return;
            }

            // Read the file content
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const jsonData = JSON.parse(reader.result);

                    // Assuming the file contains both players and teams in the format:
                    // { players: [...], teams: [...] }
                    const players = jsonData.players.map(PlayerTeam.fromJSON);
                    const teams = jsonData.teams.map(PlayerTeam.fromJSON);

                    resolve({ players, teams }); // Return both lists as an object
                } catch (error) {
                    reject(new Error("Failed to parse JSON: " + error.message));
                }
            };
            reader.onerror = () => reject(new Error("Failed to read the file: " + reader.error));
            reader.readAsText(file);

            // Cleanup: Remove input element after use
            input.remove();
        });

        // Trigger the file dialog
        input.click();
    });
}

// Render players with additional details
function renderPlayers() {
    // Clear existing player elements inside the team containers
    document.querySelectorAll('.team-content').forEach(tc => (tc.innerHTML = ''));

    // Iterate over each player and create the player div with additional details
    players.forEach(player => {
        const playerEl = document.createElement('div');
        playerEl.classList.add('player');
        playerEl.setAttribute('draggable', 'true');
        playerEl.setAttribute('data-id', player.id);

        // Construct the content for each player
        let playerInfo = `<strong>${player.name}</strong><br>`;
        playerInfo += `ID: ${player.id}<br>`;
        // Format the coordinates to 3 decimal places
        const formattedLat = player.location[0].toFixed(3); // Latitude formatted to 3 decimal places
        const formattedLon = player.location[1].toFixed(3); // Longitude formatted to 3 decimal places
        playerInfo += `Loc: (${formattedLat}, ${formattedLon})<br>`;
        // Only show coach_kid if it is not null
        if (player.coach_kid !== null) {
            playerInfo += `Coach's Kid: ${player.coach_kid}<br>`;
        }
        // Set the innerHTML of the player element with the constructed player info
        playerEl.innerHTML = playerInfo;
        // Determine the team container to append the player to
        const team = document.querySelector(`[data-team="${player.team}"]`) || document.querySelector('[data-team="null"]');
        // Append the player element to the appropriate team container
        team.appendChild(playerEl);
    });
    // Re-enable drag and drop functionality
    enableDragAndDrop();
    // Update counts and synchronize player data
    updateAndSync();
}

// Create scatter plot
function createChart() {
    chartCanvas = document.getElementById("locationChart");
    locationChart = new Chart(chartCanvas, {
        type: "scatter",
        data: {
            datasets: [],
        },
        options: {
            //responsive: true,
            scales: {
                x: { title: { display: true, text: "X Coordinate" } },
                y: { title: { display: true, text: "Y Coordinate" } },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const name = context.raw.label || "Unknown Player";
                            return `${name}`;
                        },
                    },
                },
                legend: {display: true, position: 'top'},
            },
        },
    });
    updateChart();
}


function generatePlayerDatasetForChart(){
    const playerDataset = players.map(player => ({
        x: player.location[0],
        y: player.location[1],
        backgroundColor: player.team ? teamColors[player.team] : "black",  // Player color based on team or blask if unassigned
        label: player.name,  // Player's name as label
    }));
    return playerDataset;
}

function generateTeamDatasetForChart(){
    const teamDataset = teams.map(team => ({
        label: team.name,
        data: [{ x: team.location[0], y: team.location[1] }],
        backgroundColor: teamColors[team.id],
        pointStyle: "circle",
        radius: 10,
    }));
    return teamDataset;
}

// Update scatter plot data
function updateChart() {
    if (!locationChart) return; // Guard clause to prevent errors

    const teamDataset = generateTeamDatasetForChart();
    const playerDataset = generatePlayerDatasetForChart();
    // locationChart.data.datasets = [...teamDataset, ...playerDataset];
    // Combine team and player datasets into the chart data
    locationChart.data.datasets = [
        ...teamDataset, 
        {
            label: "Players",
            data: playerDataset,
            backgroundColor: playerDataset.map(p => p.backgroundColor),
            pointStyle: "circle",
            radius: 5,
        }, 
    ];
    locationChart.update();
}

function autoAssign(){ //players, teams){
    // Initialize player rankings from distances
    calculateDistances(players, teams);
    calculateDistances(teams, players);
    players.forEach(player => {
        player.rankings = player.distances.map(distance => distance[1]);
    });

    // Continue matching until all players are assigned
    let teamMatchDepth = 1;
    const assignedPlayers = new Set();
    while (assignedPlayers.size < players.length) {
        players.forEach(player => {
            if (player.team != null) {
                assignedPlayers.add(player.id);
                return; // Skip players already assigned to a team
            }

            // Try to assign the player based on their preferences
            const preferredTeamId = player.rankings[0];
            const team = teams.find(team => team.id === preferredTeamId);

            if (!team) return; // Skip if team not found

            // Check if the team has space
            if (team.team.length === team.maxRosterSize) {
                // Team is full; remove it from player's rankings
                player.rankings.shift();
                return;
            }

            // Check if the player is within the team's top preferences
            const teamPlayerRankings = team.distances
                .slice(0, teamMatchDepth)
                .map(distance => distance[1]);

            if (teamPlayerRankings.includes(player.id)) {
                // Assign the player to the team
                player.assignToTeam(team.id);
                team.addToTeam(player.id);
                assignedPlayers.add(player.id);
            }
        });
        teamMatchDepth += 1;
        if (teamMatchDepth > 50){
            const pause = 1;
        }
    }
    return;
}

function calculateDistances(players, teams){
    players.forEach(player => {
        player.distances = teams.map(team => {
            const distance = Math.sqrt(
                Math.pow(player.location[0] - team.location[0], 2) +
                Math.pow(player.location[1] - team.location[1], 2)
            );
            return [distance, team.id];
        });
        player.sortDistances();
    })
}


// Function to sort players alphabetically within each team container
function sortPlayersAlphabetically() {
    document.querySelectorAll('.team-content').forEach(teamContent => {
        const myplayers = Array.from(teamContent.querySelectorAll('.player'));

        // Sort players by name
        myplayers.sort((a, b) => {
            const nameA = a.querySelector('strong').textContent.toLowerCase();
            const nameB = b.querySelector('strong').textContent.toLowerCase();
            return nameA.localeCompare(nameB);
        });

        // Append players back in sorted order
        myplayers.forEach(player => teamContent.appendChild(player));
    });
}

// Initialize events
document.getElementById('updateTeams').addEventListener('click', updateTeams);
document.getElementById('importData').addEventListener('click', importData);
// document.getElementById('importData').addEventListener('click', () => document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change', importData);
document.getElementById('exportData').addEventListener('click', exportData);
document.getElementById('unassignAll').addEventListener('click', unassignAllPlayers);
document.getElementById('autoAssign').addEventListener('click', () => {
    autoAssign();      // Assign players to teams
    renderPlayers();   // Update the player and team containers
    updateChart();     // Update the scatter plot
});
document.getElementById('sortAlphabetically').addEventListener('click', sortPlayersAlphabetically);





players = [];
teams = [];
createChart();
