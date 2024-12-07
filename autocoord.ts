// Required imports
import * as d3 from "d3"; // For scatter plots (if visualization is needed in web apps)

// Helper functions for math
const randomLocation = (xy: [number, number] = [0, 0], mean: number = 0, stdDev: number = 1): [number, number] => {
    const r = d3.randomNormal(mean, stdDev)();
    const theta = Math.random() * 2 * Math.PI;
    const x = r * Math.cos(theta) + xy[0];
    const y = r * Math.sin(theta) + xy[1];
    return [x, y];
};

// Define the Player class
class Player {
    id: number;
    name: string;
    location: [number, number];
    team: number[];
    friends: number[];
    distances: [number, number][]; // [distance, team_id]
    rankings: number[];
    minRosterSize: number | null;
    maxRosterSize: number | null;

    constructor(id: number, name: string, location: [number, number]) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.team = [];
        this.friends = [];
        this.distances = [];
        this.rankings = [];
        this.minRosterSize = null;
        this.maxRosterSize = null;
    }

    sortDistances() {
        this.distances.sort((a, b) => a[0] - b[0]);
    }

    addToTeam(teamId: number): boolean {
        this.team.push(teamId);
        return true;
    }

    roomOnTeam(): boolean {
        if (this.maxRosterSize === null) return false;
        return this.team.length < this.maxRosterSize;
    }
}

// Helper functions
const getPlayerById = (players: Player[], id: number): Player | undefined => {
    return players.find((player) => player.id === id);
};

const simPlayers = (numPlayers: number): Player[] => {
    return Array.from({ length: numPlayers }, (_, id) =>
        new Player(id, `Player ${id}`, randomLocation())
    );
};

const simTeams = (numTeams: number, minTeamSize: number = 0, maxTeamSize: number = 0): Player[] => {
    return Array.from({ length: numTeams }, (_, id) => {
        const team = new Player(id, `Team ${id}`, randomLocation());
        team.minRosterSize = minTeamSize;
        team.maxRosterSize = maxTeamSize;
        return team;
    });
};

// Distance calculations
const calcDistance = (player: Player, team: Player): number => {
    return Math.sqrt(
        Math.pow(player.location[0] - team.location[0], 2) +
        Math.pow(player.location[1] - team.location[1], 2)
    );
};

const calcDistances = (players: Player[], teams: Player[]) => {
    players.forEach((player) => {
        teams.forEach((team) => {
            player.distances.push([calcDistance(player, team), team.id]);
        });
    });
};

const sortDistances = (players: Player[]) => {
    players.forEach((player) => {
        player.sortDistances();
    });
};

const computePlayerTeamDistances = (players: Player[], teams: Player[]) => {
    calcDistances(players, teams);
    sortDistances(players);
    calcDistances(teams, players);
    sortDistances(teams);
};

// Matching algorithm
const medSchoolMatch = (players: Player[], teams: Player[]) => {
    players.forEach((player) => {
        player.rankings = player.distances.map((distance) => distance[1]);
    });

    const teamDict: Record<number, Player> = Object.fromEntries(
        teams.map((team) => [team.id, team])
    );

    const assignedPlayers = new Set<number>();
    let teamMatchDepth = 1;

    while (assignedPlayers.size < players.length) {
        players.forEach((player) => {
            if (player.team.length > 0) return;

            const preferredTeamId = player.rankings[0];
            const team = teamDict[preferredTeamId];

            if (team.team.length === team.maxRosterSize) {
                player.rankings.shift(); // Remove full team from preferences
                return;
            }

            const teamPlayerRankings = team.distances
                .slice(0, teamMatchDepth)
                .map((distance) => distance[1]);

            if (teamPlayerRankings.includes(player.id)) {
                player.addToTeam(team.id);
                team.addToTeam(player.id);
                assignedPlayers.add(player.id);
            }
        });
        teamMatchDepth++;
    }
};

// Main execution
const numPlayers = 66;
const numTeams = 6;
const players = simPlayers(numPlayers);
const teams = simTeams(numTeams, 10, 11);

computePlayerTeamDistances(players, teams);
medSchoolMatch(players, teams);

// To plot, integrate with a visualization library like d3.js, Plotly.js, or Chart.js
console.log(players, teams);
