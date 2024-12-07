
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import json
import random

class Player():
    def __init__(self, id:int, name:str, location:tuple[float, float]):
        self.id = id
        self.name = name
        self.location = location
        self.team = []                  # list, single item for players, list (roster) for teams 
        self.friends = []
        self.distances = []
        self.rankings = []
        self.min_roster_size = None
        self.max_roster_size = None
        self.coach_kid = None           # team.id of coach's team      

    def sort_distances(self):
        self.distances = sorted(self.distances, key=lambda x: x[0])
    
    def add_to_team(self, team_id) -> bool:
        self.team.append(team_id)

    def room_on_team(self) -> bool:
        if not self.max_roster_size:
            return False
        if len(self.team) < self.max_roster_size:
            return True
        return False

    def to_dict(self):
        # Convert the object to a dictionary for JSON serialization
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'team': self.team,
            'friends': self.friends,
            'distances': self.distances,
            'rankings': self.rankings,
            'min_roster_size': self.min_roster_size,
            'max_roster_size': self.max_roster_size,
            'coach_kid': self.coach_kid
        }


    @classmethod
    def from_dict(cls, data:dict):
        # Create a Player instance from a dictionary
        player = cls(data['id'], data['name'], tuple(data['location']))
        player.team = data.get('team', [])
        player.friends = data.get('friends', [])
        player.distances = data.get('distances', [])
        player.rankings = data.get('rankings', [])
        player.min_roster_size = data.get('min_roster_size')
        player.max_roster_size = data.get('max_roster_size')
        player.coach_kid = data.get('coach_kid')
        return player


def save_player_to_json(player: Player, filename: str):
    # Save the Player instance to a JSON file
    with open(filename, 'w') as file:
        json.dump(player.to_dict(), file, indent=4)


def load_player_from_json(filename: str) -> Player:
    # Load a Player instance from a JSON file
    with open(filename, 'r') as file:
        data = json.load(file)
    return Player.from_dict(data)

def save_players_to_json(players: list[Player], filename: str):
    """
    Save a list of Player instances to a JSON file.
    """
    with open(filename, 'w') as file:
        json.dump([player.to_dict() for player in players], file, indent=4)

def save_data_to_json(players: list[Player], teams: list[Player], filename: str):
    """
    Save players and teams 
    """
    with open(filename, 'w') as file:
        player_list = [player.to_dict() for player in players]
        team_dict = [team.to_dict() for team in teams]
        json.dump({"players": player_list, "teams": team_dict}, file, indent=4)

def load_players_from_json(filename: str) -> list[Player]:
    """
    Load a list of Player instances from a JSON file.
    """
    with open(filename, 'r') as file:
        data = json.load(file)
    return [Player.from_dict(player_data) for player_data in data]

def get_player_by_id(players: list[Player], id:int) -> Player:
    for player in players:
        if player.id == id:
            return player


def sim_players(num_players:int) -> list[Player]:
    players = []
    for p in range(num_players):
        player = Player(p+1, "Player " +str(p+1), random_location())
        players.append(player)
    return players

def sim_teams(num_teams:int, min_team_size:int=0, max_team_size:int=0) -> list[Player]:
    teams = []
    for t in range(num_teams):
        team = Player(t+1, "Team " +str(t+1), random_location([50,50],0,6))
        team.min_roster_size = min_team_size
        team.max_roster_size = max_team_size
        teams.append(team)
    return teams

def assign_coach_kids(players: list[Player], teams:list[Player]):
    for team in teams:
        # get the closest 5 players, and randomly pick one to be "coaches kid"
        # and put them on that team
        while (not team.coach_kid):
            coaches_kid = random.choice(sorted(team.distances, key=lambda x: x[0])[0:5])[1]
            player = get_player_by_id(players, coaches_kid)
            if not player.team: # kid is not on a team
                player.coach_kid = team.id
                player.add_to_team(team.id)
                team.coach_kid = player.id
                team.add_to_team(player.id)


def random_location(xy = (50,50), mean=0, std_dev=12):
    """
    Generate a random x,y cordinate from a normal distribution in radial coords, centered at xy.

    Args:
        xy ([float, float], optional): Center coordinate. Defaults to [0,0].
        mean (float, optional): Mean of the normal distribution. Defaults to 0.
        std_dev (float, optional): Standard deviation of the normal distribution. Defaults to 1.

    Returns:
        [float, float] x and y coordinates
    """
    r = np.random.normal(mean, std_dev)
    theta = np.random.random()*2*np.pi
    x = r * np.cos(theta) + xy[0]
    y = r * np.sin(theta) + xy[1]
    return (x, y)



def plot_players_by_team(players: list[Player], teams: list[Player]):
    """
    Scatter plots the players based on their location, color-coded by team.

    Parameters:
        players (list of Player): List of Player objects with team numbers.
        teams (list of Team): List of Team objects with locations.
    """
    # Extract team data
    team_x = [team.location[0] for team in teams]
    team_y = [team.location[1] for team in teams]
    team_ids = [team.id for team in teams]
    team_colors = {team: cm.tab10(i % 10) for i, team in enumerate(team_ids)}
    # Extract player data
    player_x = [player.location[0] for player in players]
    player_y = [player.location[1] for player in players]
    player_ids = [player.id for player in players]
    player_team_colors = [team_colors[player.team[0]] for player in players]
    # Create scatter plot with teams in stars
    plt.figure(figsize=(10, 7))
    plt.scatter(player_x, player_y, c=player_team_colors, s=100, alpha=0.8, edgecolors='black')
    plt.scatter(team_x, team_y, marker='*', s=200, c=team_colors.values(), edgecolors='black', label="Teams")
    for x, y, player_id in zip(player_x, player_y, player_ids):
        plt.text(x, y, str(player_id), fontsize=9, ha='right', va='bottom', color='red')
    # Add a legend for teams
    legend_handles = [plt.Line2D([0], [0], marker='o', color='w', markerfacecolor=team_colors[team], markersize=10, label=f"Team {team}") for team in team_ids]
    plt.legend(handles=legend_handles, title="Teams", loc="upper right", fontsize=10)
    # Add plot labels and title
    plt.title("Player Locations by Team", fontsize=14)
    plt.xlabel("X Coordinate", fontsize=12)
    plt.ylabel("Y Coordinate", fontsize=12)
    plt.grid(True)
    plt.show()
    x=1


def _calc_distance(player: Player, team: Player) -> float:
    return np.sqrt((player.location[0] - team.location[0])**2 + (player.location[1] - team.location[1])**2)

def _calc_distances(players: list[Player], teams: list[Player]):
    '''
    Calculate the distance from each player to team, and store that in the player.distances
    list as a tuple of (distance, team_id).
    '''
    for player in players:
        for team in teams:
            player.distances.append((_calc_distance(player, team), team.id))

def _sort_distances(players: list[Player]):
    """
    For each player in list of players, sorts the player.distances by ascending distance.
    """
    for player in players:
        player.sort_distances()

def compute_player_team_distances(players: list[Player], teams: list[Player]):
    _calc_distances(players, teams)
    _sort_distances(players)
    _calc_distances(teams, players)
    _sort_distances(teams)



def med_school_match(players: list[Player], teams:list[Player]):
    '''
    Match players to teams.  Take player's top ranked team from the players.teams list, and if
    the team has that player ranked first, add the player to the team if there is room on the team.
    Room on the team is defined by a max roster size.  Loop over all players.
    Continue to iterate, going deeper into the team's ranking and adding that player if there is room.
    If a player's first ranked team is full, move on to the player's second ranked team, and so on until
    all players are assigned to a team.
    '''
    for player in players:
        player.rankings = [x[1] for x in player.distances]
    # Create a lookup for teams by their IDs
    team_dict = {team.id: team for team in teams}
    team_match_depth = 1
    # Create a dictionary to track which players are assigned
    assigned_players = set()
    # Continue matching until all players are assigned
    while len(assigned_players) < len(players):
        for player in players:
            if player.team:
                continue  # Skip already assigned to a team
            # Try to assign the player based on their preferences
            preferred_team_id = player.rankings[0]
            team = team_dict.get(preferred_team_id)
            # Check if the team exists and has space
            if len(team.team) == team.max_roster_size:  # team is full, move on to the next team
                player.rankings.remove(preferred_team_id)
                continue
            team_player_rankings = [x[1] for x in team.distances][:team_match_depth]
            if player.id in team_player_rankings:
                # Assign the player to the team
                player.add_to_team(team.id)
                team.add_to_team(player.id)
                assigned_players.add(player.id)
                continue
        team_match_depth += 1
    return 


if __name__ == "__main__":
    num_players = 66
    num_teams = 6
    players = sim_players(num_players)
    teams = sim_teams(num_teams, 10, 11)
    compute_player_team_distances(players, teams)
    assign_coach_kids(players, teams)
    # make_friends(players)
    # save_players_to_json(players, "ex_players.json")
    # save_players_to_json(teams, "ex_teams.json")
    save_data_to_json(players, teams, "ex_data.json")


    # med_school_match(players, teams)
    # plot_players_by_team(players, teams)
    x=1

