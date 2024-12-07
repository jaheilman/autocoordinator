
import numpy as np


class PlayerTeam():
    def __init__(self, id:int, name:str, location:tuple[float, float]):
        self.id = id
        self.name = name
        self.location = location
        self.team = []
        self.friends = []
        self.distances = []
        self.rankings = []
        self.min_roster_size = None
        self.max_roster_size = None

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


def med_school_match(players: list[PlayerTeam], teams:list[PlayerTeam]):
    '''
    Match players to teams.  Starting with a player's top ranked team from the players.rankings list, 
    see if that team has that player ranked first, and if the team has room.  Loop over all players
    to match top ranks.  
    Continue to iterate, going deeper into the team's ranking and adding that player if there is room.
    If a player's first ranked team is full, remove it from the player's rankings, and so on until
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