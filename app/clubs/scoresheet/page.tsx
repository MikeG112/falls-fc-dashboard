import { Card, Title, Text } from '@tremor/react';
import { EditableScheduleTable } from '../table';
import {getCurrentSeason, getSeasonTeams, getSeasonGames} from '../../api/db'

export default async function IndexPage() {

  // Query DB, or mock calls
  const currentSeason = await getCurrentSeason();

  if (!currentSeason) {
    throw new Error("DB does not contain a current season. Try using mock data or inserting data, or handling this.")
  }

  const allGames = await getSeasonGames(currentSeason.id);
  const teams = await getSeasonTeams(currentSeason.id);

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Current Season Schedule</Title>
      <Text>All Matches</Text>
      <Card className="mt-6">
        <EditableScheduleTable teams={teams} games={allGames} />
      </Card>
    </main>
  );
}
