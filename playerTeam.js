class PlayerTeam {
    constructor(id, name, location) {
        this.id = id;
        this.name = name;
        this.location = location; // Assume [latitude, longitude]
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

    addToTeam(teamId) {
        this.team.push(teamId);
    }

    roomOnTeam() {
        if (this.maxRosterSize === null) {
            return false;
        }
        return this.team.length < this.maxRosterSize;
    }
}
