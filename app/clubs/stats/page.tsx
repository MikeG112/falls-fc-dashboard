import { Card, Metric, Text, Title, BarList, Flex, Grid } from '@tremor/react';
import { Game, Team, TeamStats, StatSummary } from '../interfaces';
import { getCurrentSeason, getSeasonTeams, getSeasonGames } from '../../api/db';

// Using the listed teams, get all relevant games

// Function to take all season games, and all season teams,
// And get all goals for, goals against, losses, wins, ties.
function getTeamStats(games: Game[], teams: Team[]): TeamStats[] {
  const teamStats: { [teamId: number]: TeamStats } = {};

  // Initialize teamStats with each team
  teams.forEach((team) => {
    teamStats[team.id] = {
      teamName: team.name,
      goalsFor: 0,
      goalsAgainst: 0,
      wins: 0,
      losses: 0,
      ties: 0
    };
  });

  // Calculate stats for each game
  games.forEach((game) => {
    const homeTeam = teamStats[game.home_team_id];
    const awayTeam = teamStats[game.away_team_id];

    // Goals For and Goals Against
    homeTeam.goalsFor = game.home_team_score
      ? homeTeam.goalsFor + game.home_team_score
      : homeTeam.goalsFor;
    homeTeam.goalsAgainst = game.away_team_score
      ? homeTeam.goalsAgainst + game.away_team_score
      : homeTeam.goalsAgainst;

    awayTeam.goalsFor = game.away_team_score
      ? awayTeam.goalsFor + game.away_team_score
      : awayTeam.goalsFor;
    awayTeam.goalsAgainst = game.home_team_score
      ? awayTeam.goalsAgainst + game.home_team_score
      : awayTeam.goalsAgainst;

    // Wins, Losses, Ties
    if (
      game.home_team_score &&
      game.away_team_score &&
      game.home_team_score > game.away_team_score
    ) {
      homeTeam.wins++;
      awayTeam.losses++;
    } else if (
      game.home_team_score &&
      game.away_team_score &&
      game.home_team_score < game.away_team_score
    ) {
      homeTeam.losses++;
      awayTeam.wins++;
    } else if (game.home_team_score && game.away_team_score) {
      homeTeam.ties++;
      awayTeam.ties++;
    }
  });

  // Convert teamStats object to array of TeamStats
  const teamStatsArray: TeamStats[] = Object.values(teamStats);

  return teamStatsArray;
}

function summarizeAndSortTeamStats(
  teamStats: TeamStats[],
  statCategory: keyof TeamStats
): StatSummary {
  // Calculate total stat
  const totalStat = teamStats.reduce(
    (sum, teamStat) => sum + (teamStat[statCategory] as number),
    0
  );

  // Sort teamStats based on the specified statCategory
  const sortedTeamStats = teamStats
    .slice()
    .sort((a, b) => (b[statCategory] as number) - (a[statCategory] as number))
    .map((team) => ({
      name: team.teamName,
      value: team[statCategory] as number
    }));

  return {
    statName: statCategory,
    total: totalStat,
    stats: sortedTeamStats
  };
}
export default async function ClubsPage() {
  // Query DB, or mock calls
  const currentSeason = await getCurrentSeason();

  if (!currentSeason) {
    throw new Error(
      'DB does not contain a current season. Try using mock data or inserting data, or handling this.'
    );
  }
  const allGames = await getSeasonGames(currentSeason.id);
  const teams = await getSeasonTeams(currentSeason.id);
  const teamStats = getTeamStats(allGames, teams);

  const data = [
    {
      category: 'Wins',
      headline_title: 'Total Wins',
      data: summarizeAndSortTeamStats(teamStats, 'wins')
    },
    {
      category: 'Losses',
      headline_title: 'Total Losses',
      data: summarizeAndSortTeamStats(teamStats, 'losses')
    },
    {
      category: 'Ties',
      headline_title: 'Total Ties',
      data: summarizeAndSortTeamStats(teamStats, 'ties')
    },
    {
      category: 'Goals For',
      headline_title: 'Total Goals For',
      data: summarizeAndSortTeamStats(teamStats, 'goalsFor')
    },
    {
      category: 'Goals Against',
      headline_title: 'Total Goals Against',
      data: summarizeAndSortTeamStats(teamStats, 'goalsAgainst')
    }
  ];

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Grid numItemsSm={2} numItemsLg={3} className="gap-6">
        {data.map((item) => (
          <Card key={item.category}>
            <Title>{item.category}</Title>
            <Flex
              justifyContent="start"
              alignItems="baseline"
              className="space-x-2"
            >
              <Metric>{item.data.total}</Metric>
              <Text>Total {item.category}</Text>
            </Flex>
            <Flex className="mt-6">
              <Text>Club</Text>
              <Text className="text-right">{item.category}</Text>
            </Flex>
            <BarList
              data={item.data.stats}
              valueFormatter={(number: number) =>
                Intl.NumberFormat('us').format(number).toString()
              }
              className="mt-2"
            />
          </Card>
        ))}
      </Grid>
      {/* <Chart /> */}
    </main>
  );
}
