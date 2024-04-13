'use client';
import React from 'react';
import { useState } from 'react';
import {
  Button,
  NumberInput,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text
} from '@tremor/react';
import {
  Game,
  User,
  Team,
  TeamAssignment,
  TeamAssignedUser
} from './interfaces';
import { UserIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { dateFormatter } from './utils';

import {
  BoltIcon,
  ExclamationTriangleIcon,
  FireIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

import { clearGame, editGame } from '../api/db';

// Map database components to React components
const flagComponents: { [key: string]: React.FC } = {
  bolt: BoltIcon,
  triangle: ExclamationTriangleIcon,
  alt: GlobeAltIcon,
  fire: FireIcon,
  unknown: UserIcon
};

// Function to render team component based on team data
const renderTeamFlag = (team: Team): React.ReactElement | null => {
  const TeamComponent = flagComponents[team.flag_key];
  return TeamComponent ? (
    <div className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true">
      <TeamComponent />
    </div>
  ) : null;
};

function getColor(color: string) {
  if (color === 'orange') {
    return 'coral';
  } else if (color == 'blue') {
    return 'LightSkyBlue';
  } else if (color == 'silver') {
    return 'Silver';
  } else if (color == 'green') {
    return 'MediumSeaGreen';
  } else {
    return 'inherit';
  }
}

export function UsersTable({
  users,
  teamAssignments,
  teams
}: {
  users: User[];
  teamAssignments: TeamAssignment[];
  teams: Team[];
}) {
  const getTeamIcon = (team: Team | null) => {
    if (team) {
      return renderTeamFlag(team);
    }

    // Instantiate the free agent icon
    else {
      return (
        <UserIcon className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
      );
    }
  };

  function sortUsersByTeam(
    users: User[],
    teamAssignments: TeamAssignment[],
    teams: Team[]
  ): TeamAssignedUser[] {
    // Create a map to group users by team
    const usersByTeam: { [teamId: number]: User[] } = {};

    // Populate the map based on team assignments
    teamAssignments.forEach((assignment: TeamAssignment) => {
      const user = users.find((u) => u.id === assignment.user_id);
      if (user) {
        const teamId = assignment.team_id;
        if (!usersByTeam[teamId]) {
          usersByTeam[teamId] = [];
        }
        usersByTeam[teamId].push(user);
      }
    });

    // Sort users within each team alphabetically by name
    Object.keys(usersByTeam).forEach((teamId: string) => {
      const numericTeamId = Number(teamId);
      usersByTeam[numericTeamId].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Sort teams alphabetically
    const sortedTeams = Object.keys(usersByTeam).sort((a, b) =>
      usersByTeam[Number(a)][0].name.localeCompare(
        usersByTeam[Number(b)][0].name
      )
    );

    // Create the final sorted array of users with associated teams
    const sortedUsers: TeamAssignedUser[] = [];
    sortedTeams.forEach((teamId: string) => {
      const numericTeamId = Number(teamId);
      const teamName =
        teams.find((team) => team.id === numericTeamId)?.name || 'Unknown Team';
      const teamFlagKey =
        teams.find((team) => team.id === numericTeamId)?.flag_key ||
        'Unknown Flag';
      const teamColor =
        teams.find((team) => team.id === numericTeamId)?.color || 'Unknown';

      const team = {
        id: numericTeamId,
        name: teamName, // Assuming the team name is the same for all users in a team
        flag_key: teamFlagKey,
        color: teamColor
      };
      usersByTeam[numericTeamId].forEach((user) => {
        sortedUsers.push({
          ...user,
          team: { ...team }
        });
      });
    });

    return sortedUsers;
  }

  const sortedTeamAssignedUsers = sortUsersByTeam(
    users,
    teamAssignments,
    teams
  );

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Team</TableHeaderCell>
          <TableHeaderCell>Team Flag</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedTeamAssignedUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell
              style={{ color: getColor(user.team.color), whiteSpace: 'nowrap' }}
            >
              {user.team ? user.team.name : 'Free Agent'}
            </TableCell>
            <TableCell>{getTeamIcon(user.team)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ScheduleTable({
  games,
  teams
}: {
  games: Game[];
  teams: Team[];
}) {
  const getTeamIcon = (team: Team | null) => {
    if (team) {
      return renderTeamFlag(team);
    }

    // Instantiate the free agent icon
    else {
      return (
        <UserIcon className="mr-3 h-4 w-4 text-gray-400" aria-hidden="true" />
      );
    }
  };

  function sortGamesByDate(games: Game[]): Game[] {
    // Use the Array.sort() method with a custom comparator function
    return games.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  function getTeamById(teams: Team[], teamId: number): Team | null {
    const foundTeam = teams.find((team) => team.id === teamId);
    return foundTeam ? foundTeam : null;
  }

  const sortedGames = sortGamesByDate(games);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Home Team</TableHeaderCell>
          <TableHeaderCell>Away Team</TableHeaderCell>
          <TableHeaderCell>Home Score</TableHeaderCell>
          <TableHeaderCell>Away Score</TableHeaderCell>
          <TableHeaderCell>Date</TableHeaderCell>
          <TableHeaderCell>Field</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedGames.map((game) => {
          const fieldText = game.id % 2 === 0 ? 'Back' : 'Front';

          const homeTeam = getTeamById(teams, game.home_team_id);
          const awayTeam = getTeamById(teams, game.away_team_id);

          let homeTeamColor = 'inherit';
          let awayTeamColor = 'inherit';

          const winColor = 'blue';
          const tieColor = 'purple';

          if (game.home_team_score !== null && game.away_team_score !== null) {
            // Home team won
            if (game.home_team_score > game.away_team_score) {
              homeTeamColor = winColor;
            }

            // Away team won
            else if (game.away_team_score > game.home_team_score) {
              awayTeamColor = winColor;
            }

            // Tie
            else {
              homeTeamColor = tieColor;
              awayTeamColor = tieColor;
            }
          }

          return (
            <TableRow key={game.id}>
              <TableCell
                style={{
                  color: homeTeamColor,
                  whiteSpace: 'nowrap'
                }}
              >
                {homeTeam?.name}
              </TableCell>
              <TableCell style={{ color: awayTeamColor, whiteSpace: 'nowrap' }}>
                {awayTeam?.name}
              </TableCell>
              <TableCell>
                {game.home_team_score !== null ? game.home_team_score : 'TBD'}
              </TableCell>
              <TableCell>
                {game.away_team_score !== null ? game.away_team_score : 'TBD'}
              </TableCell>
              <TableCell>{dateFormatter.format(game.date)}</TableCell>
              <TableCell> {fieldText}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

async function editGameData(
  gameId: number,
  homeScore: number,
  awayScore: number
) {
  await editGame(gameId, homeScore, awayScore);
}

async function clearGameData(gameId: number) {
  await clearGame(gameId);
}

export function EditableScheduleTable({
  games,
  teams
}: {
  games: Game[];
  teams: Team[];
}) {
  interface ScoreList {
    [key: number]: number; // or any other type that makes sense
  }

  // Initialize score lists
  const initialHomeScores: ScoreList = {};
  const initialAwayScores: ScoreList = {};

  // Iterate over the list of games to fill initial scores
  games.forEach((game) => {
    // Check if home_team_score is not null
    if (game.home_team_score !== null) {
      initialHomeScores[game.id] = game.home_team_score;
    } else {
      initialHomeScores[game.id] = 0;
    }

    // Check if away_team_score is not null
    if (game.away_team_score !== null) {
      initialAwayScores[game.id] = game.away_team_score;
    } else {
      initialAwayScores[game.id] = 0;
    }
  });

  const [homeScores, setHomeScores] = useState(initialHomeScores);
  const [awayScores, setAwayScores] = useState(initialAwayScores);

  const handleScoreChange = (
    gameId: number,
    teamType: string,
    score: number | null
  ) => {
    if (teamType === 'home') {
      setHomeScores((prevScores: {}) => ({ ...prevScores, [gameId]: score }));
    } else if (teamType === 'away') {
      setAwayScores((prevScores: {}) => ({ ...prevScores, [gameId]: score }));
    }
  };

  const editScores = (gameId: number) => {
    // Placeholder for the actual API call to update scores in the database
    // Can use for debug
    const homeScore = homeScores[gameId];
    const awayScore = awayScores[gameId];

    // Perform your API call here to update the scores in the database
    if (homeScore !== null && awayScore !== null) {
      editGameData(gameId, homeScore, awayScore);
    }
  };

  const clearScores = (gameId: number) => {
    const homeScore = homeScores[gameId];
    const awayScore = awayScores[gameId];

    // Perform your API call here to update the scores in the database
    if (homeScore !== null && awayScore !== null) {
      clearGameData(gameId);
    }
  };

  function sortGamesByDate(games: Game[]): Game[] {
    return games.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  function getTeamById(teams: Team[], teamId: number): Team | null {
    const foundTeam = teams.find((team) => team.id === teamId);
    return foundTeam ? foundTeam : null;
  }

  const sortedGames = sortGamesByDate(games);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Home Team</TableHeaderCell>
          <TableHeaderCell>Away Team</TableHeaderCell>
          <TableHeaderCell>Home Score</TableHeaderCell>
          <TableHeaderCell>Away Score</TableHeaderCell>
          <TableHeaderCell>Date</TableHeaderCell>
          <TableHeaderCell>Field</TableHeaderCell>
          <TableHeaderCell>Enter Score</TableHeaderCell>
          <TableHeaderCell>Clear Score</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedGames.map((game) => {
          const fieldText = game.id % 2 === 0 ? 'Back' : 'Front';

          const homeTeam = getTeamById(teams, game.home_team_id);
          const awayTeam = getTeamById(teams, game.away_team_id);

          let homeTeamColor = 'inherit';
          let awayTeamColor = 'inherit';

          const winColor = 'blue';
          const tieColor = 'purple';

          if (game.home_team_score !== null && game.away_team_score !== null) {
            // Home team won
            if (game.home_team_score > game.away_team_score) {
              homeTeamColor = winColor;
            }

            // Away team won
            else if (game.away_team_score > game.home_team_score) {
              awayTeamColor = winColor;
            }

            // Tie
            else {
              homeTeamColor = tieColor;
              awayTeamColor = tieColor;
            }
          }

          return (
            <TableRow key={game.id}>
              <TableCell
                style={{
                  color: homeTeamColor,
                  whiteSpace: 'nowrap'
                }}
              >
                {homeTeam?.name}
              </TableCell>
              <TableCell style={{ color: awayTeamColor, whiteSpace: 'nowrap' }}>
                {awayTeam?.name}
              </TableCell>
              <TableCell>
                <NumberInput
                  placeholder="Score..."
                  value={homeScores[game.id] || 0}
                  onChange={(e) => {
                    const newScore = parseInt(e.target.value);
                    handleScoreChange(game.id, 'home', newScore);
                  }}
                />
              </TableCell>
              <TableCell>
                <NumberInput
                  placeholder="Score..."
                  value={awayScores[game.id] || 0}
                  onChange={(e) => {
                    const newScore = parseInt(e.target.value);
                    handleScoreChange(game.id, 'away', newScore);
                  }}
                />
              </TableCell>
              <TableCell>{dateFormatter.format(game.date)}</TableCell>
              <TableCell>{fieldText}</TableCell>
              <TableCell>
                <Button
                  onClick={() => {
                    editScores(game.id);
                    toast.success('Scores edited');
                  }}
                >
                  Submit Game Scores
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  color="red"
                  onClick={() => {
                    clearScores(game.id);
                    toast.success('Scores cleared');
                  }}
                >
                  Clear Game
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
