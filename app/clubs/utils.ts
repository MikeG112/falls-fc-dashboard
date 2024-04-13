import { Team, TeamAssignment, User } from './interfaces';

function assignRandomTeams(
    users: User[],
    teams: Team[],
    season_id: number
  ): TeamAssignment[] {
    const teamAssignments: TeamAssignment[] = [];
  
    // Shuffle users randomly
    const shuffledUsers = users.sort(() => Math.random() - 0.5);
  
    // Calculate number of users per team
    const usersPerTeam = Math.floor(shuffledUsers.length / teams.length);
  
    let assignmentCount = 0;
  
    // Fill each team with users
    teams.forEach((team, index) => {
      const teamUsers = shuffledUsers.slice(
        index * usersPerTeam,
        (index + 1) * usersPerTeam
      );
      teamUsers.forEach((user) => {
        teamAssignments.push({
          id: assignmentCount,
          user_id: user.id,
          team_id: team.id,
          season_id: season_id
        });
        assignmentCount += 1;
      });
    });
  
    // Handle remaining users (if divisibility doesn't work out)
    for (let i = 0; i < shuffledUsers.length % teams.length; i++) {
      const user = shuffledUsers[teams.length * usersPerTeam + i];
      teamAssignments.push({
        id: assignmentCount,
        user_id: user.id,
        team_id: teams[i].id,
        season_id: season_id
      });
      assignmentCount += 1;
    }
  
    return teamAssignments;
  }
  
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  };
  
export const dateFormatter = new Intl.DateTimeFormat('en-US', options as Intl.DateTimeFormatOptions);