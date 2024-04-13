'use server'
import { db, sql } from '@vercel/postgres';
import { Game, User, Team, TeamAssignment, Season } from '../clubs/interfaces';
import { createDateAtMidnight } from '../utils';
import { revalidatePath } from 'next/cache'

// Determine whether to use mocked data or not
// Useful for local dev with no DB
const useMockData = process.env.USE_MOCK_DATA === 'true';

// TODO: handle timeouts ala https://vercel.com/guides/what-can-i-do-about-vercel-serverless-functions-timing-out

const mockCurrentSeason: Season = {
  id: 1,
  name: '2024-W1-inaugural',
  start_date: createDateAtMidnight(2024, 1, 11),
  end_date: createDateAtMidnight(2024, 2, 15)
};

// Get current season based on current date
export async function getCurrentSeason(
  useMock: boolean = useMockData
): Promise<Season | null> {
  if (useMock) {
    return mockCurrentSeason;
  } else {
    // Query the database for the current season
    const currentDate = new Date();

    // const { rows } = await sql`
    //   SELECT *
    //   FROM seasons
    //   WHERE end_date >= ${currentDate.toISOString()}
    //   LIMIT 1;
    // `;

    const { rows } = await sql`
    SELECT *
    FROM seasons
    ORDER BY end_date DESC
    LIMIT 1;
  `;

    if (rows.length > 0) {
      // Convert the database row to a Season instance
      const result: Season = {
        id: rows[0].id,
        name: rows[0].name,
        start_date: rows[0].start_date,
        end_date: rows[0].end_date
      };

      return result;
    } else {
      return null; // No matching season found
    }
  }
}

const mockTeams = [
  {
    id: 1,
    name: 'Ridge Avenue Potholes',
    flag_key: 'bolt',
    color: 'blue'
  },
  {
    id: 2,
    name: "Mcdevitt's Divets",
    flag_key: 'triangle',
    color: 'orange'
  },
  {
    id: 3,
    name: 'East Falls United',
    flag_key: 'alt',
    color: 'silver'
  },
  {
    id: 4,
    name: 'East Falls FC',
    flag_key: 'fire',
    color: 'green'
  }
] as Team[];

// Get all teams associated with a season
export async function getSeasonTeams(
  seasonID: number,
  useMock: boolean = useMockData
): Promise<Team[]> {
  if (useMock) {
    return mockTeams;
  } else {
    // Get season team assignments
    const seasonAssignments = await getSeasonAssignments(seasonID, useMock);
    const seasonTeamIds: number[] = seasonAssignments.map(
      (elt: TeamAssignment) => elt.team_id
    );


    const uniqueTeamIds = new Set(seasonTeamIds);
    // Convert the Set back to an array
    const uniqueTeamIdArray = [...uniqueTeamIds];

    const client = await db.connect();
    const placeholders = Array.from(
      { length: uniqueTeamIdArray.length },
      (_, i) => `$${i + 1}`
    ).join(', ');
    const queryText = `SELECT * FROM teams WHERE id IN (${placeholders});`;

    const { rows } = await client.query(queryText, uniqueTeamIdArray);

    client.release()

    // const { rows } = await client.query(queryText, seasonTeamIds);

    // Convert the database rows to a TeamAssignment list
    const result: Team[] = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      flag_key: row.flag_key,
      color: row.color
    }));

    return result;
  }
}

const mockUsers = [
  {
    id: 1,
    name: 'Person 1',
    username: 'peep1',
    email: 'fake@email.com'
  },
  {
    id: 2,
    name: 'Person 2',
    username: 'peep2',
    email: 'fake@email2.com'
  },
  {
    id: 3,
    name: 'Person 3',
    username: 'peep3',
    email: 'fake@email3.com'
  },
  {
    id: 4,
    name: 'Person 4',
    username: 'peep4',
    email: 'fake@email4.com'
  },
  {
    id: 5,
    name: 'Person 5',
    username: 'peep5',
    email: 'fake@email5.com'
  }
] as User[];

// Get all users associated with a season
export async function getSeasonUsers(
  seasonID: number,
  useMock: boolean = useMockData
): Promise<User[]> {
  if (useMock) {
    return mockUsers;
  } else {
    // Get season team assignments
    const seasonAssignments = await getSeasonAssignments(seasonID, useMock);
    const seasonUserIds: number[] = seasonAssignments.map(
      (elt: TeamAssignment) => elt.user_id
    );

    const client = await db.connect();
    const placeholders = Array.from(
      { length: seasonUserIds.length },
      (_, i) => `$${i + 1}`
    ).join(', ');
    const queryText = `SELECT * FROM users WHERE id IN (${placeholders});`;

    const { rows } = await client.query(queryText, seasonUserIds);
    client.release()

    // Convert the database rows to a TeamAssignment list
    const result: User[] = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      username: row.username,
      email: row.email
    }));

    return result;
  }
}

const mockInitialAssignments = [
  { id: 1, user_id: 1, team_id: 1, season_id: 1 },
  { id: 2, user_id: 2, team_id: 1, season_id: 1 },
  { id: 3, user_id: 3, team_id: 2, season_id: 1 },
  { id: 4, user_id: 4, team_id: 2, season_id: 1 },
  { id: 5, user_id: 5, team_id: 3, season_id: 1 }
] as TeamAssignment[];
// Get all team assignments associated with a season
export async function getSeasonAssignments(
  seasonID: number,
  useMock: boolean = useMockData
): Promise<TeamAssignment[]> {
  if (useMock) {
    return mockInitialAssignments;
  } else {
    const { rows } = await sql`
      SELECT *
      FROM team_assignments
      WHERE season_id = ${seasonID}
      ORDER BY team_id;
    `;

    // Convert the database rows to a TeamAssignment list
    const result: TeamAssignment[] = rows.map((row: any) => ({
      id: row.id,
      team_id: row.team_id,
      user_id: row.user_id,
      season_id: row.season_id
    }));

    return result;
  }
}

const mockGames = [
  {
    id: 1,
    season_id: 1,
    date: createDateAtMidnight(2024, 1, 11),
    home_team_id: 1,
    away_team_id: 2,
    home_team_score: null,
    away_team_score: null
  },
  {
    id: 2,
    season_id: 1,
    date: createDateAtMidnight(2024, 1, 11),
    home_team_id: 3,
    away_team_id: 4,
    home_team_score: null,
    away_team_score: null
  },
  {
    id: 3,
    season_id: 1,
    date: createDateAtMidnight(2024, 1, 18),
    home_team_id: 1,
    away_team_id: 3,
    home_team_score: null,
    away_team_score: null
  },
  {
    id: 4,
    season_id: 1,
    date: createDateAtMidnight(2024, 1, 18),
    home_team_id: 2,
    away_team_id: 4,
    home_team_score: null,
    away_team_score: null
  },
  {
    id: 5,
    season_id: 1,
    date: createDateAtMidnight(2024, 1, 25),
    home_team_id: 1,
    away_team_id: 4,
    home_team_score: null,
    away_team_score: null
  },
  {
    id: 6,
    season_id: 1,
    date: createDateAtMidnight(2024, 1, 25),
    home_team_id: 2,
    away_team_id: 3,
    home_team_score: null,
    away_team_score: null
  }
] as Game[];

// Get all games assigned for a season
export async function getSeasonGames(
  seasonID: number,
  useMock: boolean = useMockData
): Promise<Game[]> {
  if (useMock) {
    return mockGames;
  } else {
    const { rows } = await sql`
      SELECT *
      FROM games
      WHERE season_id = ${seasonID}
      ORDER BY id;
    `;

    // Convert the database rows to a TeamAssignment list
    const result: Game[] = rows.map((row) => ({
      id: row.id,
      season_id: row.season_id,
      date: row.date,
      home_team_id: row.home_team_id,
      away_team_id: row.away_team_id,
      home_team_score: row.home_team_score,
      away_team_score: row.away_team_score
    }));

    return result;
  }
}

// Update stats for a game
export async function editGame(
  gameId: number,
  home_team_score: number | null,
  away_team_score: number | null,
  useMock: boolean = useMockData
) {
    if (useMock) {
      console.log("Not altering data in mock context!")
    }
    else {
    // Update statement
    await sql`
      UPDATE games SET home_team_score = ${home_team_score}, away_team_score = ${away_team_score}
      WHERE id = ${gameId};
    `;
    }
    revalidatePath('/clubs/scoresheet');
}

// Update stats for a game
export async function clearGame(
  gameId: number,
  useMock: boolean = useMockData
) {
    if (useMock) {
      console.log("Not altering data in mock context!")
    }
    else {
    // Update statement
    await sql`
      UPDATE games SET home_team_score=NULL, away_team_score=NULL
      WHERE id=${gameId};
    `;
    }
    revalidatePath('/clubs/scoresheet');
}