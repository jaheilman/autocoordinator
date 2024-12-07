
# def plot_coordinates(coordinates:list[tuple[float,float]]):
#     plt.figure()
#     x_vals, y_vals = zip(*coordinates)
#     plt.scatter(x_vals, y_vals)#, label=f"{myint}")

#     plt.title("Coordinate plot")
#     plt.xlabel("X")
#     plt.ylabel("Y")
#     plt.legend()
#     plt.grid(True)
#     plt.show()
#     x=1

# def plot_players(players: list[Player]):
#     """
#     Plots players on a 2D scatter plot based on their locations
#     and labels each point with the player's ID.

#     Parameters:
#         players (list of Player): List of Player objects with id and location attributes.
#     """
#     # Extract x, y coordinates and ids
#     x_coords = [player.location[0] for player in players]
#     y_coords = [player.location[1] for player in players]
#     ids = [player.id for player in players]
#     # Create the scatter plot
#     plt.figure()#figsize=(8, 6))
#     plt.scatter(x_coords, y_coords, s=100, alpha=0.7, label="Players")
#     # Label each dot with the player's ID
#     for x, y, player_id in zip(x_coords, y_coords, ids):
#         plt.text(x, y, str(player_id), fontsize=9, ha='right', va='bottom', color='red')
#     # Set plot labels and title
#     plt.title("Player Locations", fontsize=14)
#     plt.xlabel("X Coordinate", fontsize=12)
#     plt.ylabel("Y Coordinate", fontsize=12)
#     plt.grid(True)
#     plt.legend()
#     plt.show()




# def group_longest_drive_first(players: list[Player], teams: list[Player]):
#     # (distance, team_id, player_id)
#     dtp_longest_first = [(player.distances[0], player.distances[1], player.id) for player in players]
#     dtp_longest_first.sort(key=lambda x: x[0], reverse=True)
#     for dtp in dtp_longest_first:
#         player = get_player_by_id(players, dtp[2])
#         for team_rank in player.distances:
#             team = get_player_by_id(teams, team_rank[1])
#             if (team.room_on_team()):
#                 player.add_to_team(team.id)
#                 team.add_to_team(player.id)
#                 break
#     return