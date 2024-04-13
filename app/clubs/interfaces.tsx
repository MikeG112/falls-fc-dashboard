// User Interface
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

// Team Interface
export interface Team {
  id: number;
  name: string;
  flag_key: string;
  color: string;
}

export interface TeamAssignedUser {
  id: number;
  name: string;
  username: string;
  email: string;
  team: Team; // Subobject for the associated team
}

// Season Interface
export interface Season {
  id: number;
  name: string;
  start_date: Date;
  end_date: Date;
}

// TeamAssignment Interface
export interface TeamAssignment {
  id: number;
  user_id: number;
  team_id: number;
  season_id: number;
}

// Game Interface
export interface Game {
  id: number;
  season_id: number;
  date: Date;
  home_team_id: number;
  away_team_id: number;
  home_team_score: number | null;
  away_team_score: number | null;
}

// GameStat Interface
export interface GameStat {
  id: number;
  game_id: number;
  user_id: number;
  goals: number;
  assists: number;
}


//  Other Stat Aggregates
export interface TeamStats {
  teamName: string;
  goalsFor: number;
  goalsAgainst: number;
  wins: number;
  losses: number;
  ties: number;
}

export interface StatSummary {
  statName: string;
  total: number;
  stats: { name: string; value: number }[];
}