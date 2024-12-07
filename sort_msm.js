
function medSchoolMatch(players, teams) {
    // Initialize player rankings from distances
    players.forEach(player => {
        player.rankings = player.distances.map(distance => distance[1]);
    });

    // Create a lookup for teams by their IDs
    const teamDict = Object.fromEntries(teams.map(team => [team.id, team]));
    let teamMatchDepth = 1;
    const assignedPlayers = new Set();

    // Continue matching until all players are assigned
    while (assignedPlayers.size < players.length) {
        players.forEach(player => {
            if (player.team.length > 0) {
                return; // Skip players already assigned to a team
            }

            // Try to assign the player based on their preferences
            const preferredTeamId = player.rankings[0];
            const team = teamDict[preferredTeamId];

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
                player.addToTeam(team.id);
                team.addToTeam(player.id);
                assignedPlayers.add(player.id);
            }
        });

        teamMatchDepth += 1;
    }

    return;
}


// const fs = require('fs'); // Import the filesystem module for file operations

// function savePlayerTeamsToJSON(playerTeams, filename) {
//     // Convert PlayerTeam objects to plain objects for JSON serialization
//     const data = playerTeams.map(playerTeam => ({
//         id: playerTeam.id,
//         name: playerTeam.name,
//         location: playerTeam.location,
//         team: playerTeam.team,
//         friends: playerTeam.friends,
//         distances: playerTeam.distances,
//         rankings: playerTeam.rankings,
//         minRosterSize: playerTeam.minRosterSize,
//         maxRosterSize: playerTeam.maxRosterSize
//     }));

//     // Serialize to JSON and write to the specified file
//     fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
// }

// function loadPlayerTeamsFromJSON(filename) {
//     // Read the file content
//     const data = fs.readFileSync(filename, 'utf-8');
    
//     // Parse the JSON data and convert to PlayerTeam instances
//     const parsedData = JSON.parse(data);
//     return parsedData.map(item => {
//         const playerTeam = new PlayerTeam(item.id, item.name, item.location);
//         playerTeam.team = item.team;
//         playerTeam.friends = item.friends;
//         playerTeam.distances = item.distances;
//         playerTeam.rankings = item.rankings;
//         playerTeam.minRosterSize = item.minRosterSize;
//         playerTeam.maxRosterSize = item.maxRosterSize;
//         return playerTeam;
//     });
// }


// // Example usage:
// const teams = [
//     new PlayerTeam(1, "Team A", [34.0522, -118.2437]),
//     new PlayerTeam(2, "Team B", [40.7128, -74.0060])
// ];

// // Customize properties for demonstration
// teams[0].team.push(101, 102);
// teams[1].minRosterSize = 5;
// teams[1].maxRosterSize = 10;

// savePlayerTeamsToJSON(teams, 'player_teams.json');
