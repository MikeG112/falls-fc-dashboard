import { Card, Title, Text } from '@tremor/react';
import { Suspense } from 'react';
// import { User } from './interfaces';
// import Search from '../search';
import { UsersTable } from './table';
import {getSeasonUsers, getCurrentSeason, getSeasonTeams, getSeasonAssignments} from '../api/db'
import {dateFormatter} from './utils'


export default async function IndexPage() {
  // const search = searchParams.q ?? '';

  // function clientSideSearchUsers(users: User[], searchTerm: string) {
  //   // Convert the search term to lowercase for case-insensitive comparison
  //   const lowerCaseSearchTerm = searchTerm.toLowerCase();

  //   // Use the filter method to find objects with matching user names
  //   const matchingUsers = users.filter((user) =>
  //     user.name.toLowerCase().includes(lowerCaseSearchTerm)
  //   );

  //   return matchingUsers;
  // }

    // Query DB, or mock calls
  const currentSeason = await getCurrentSeason();

  if (!currentSeason) {
    throw new Error("DB does not contain a current season. Try using mock data or inserting data, or handling this.")
  }

  const users = await getSeasonUsers(currentSeason.id);
  const teams = await getSeasonTeams(currentSeason.id);
  const initialAssignments = await getSeasonAssignments(currentSeason.id);


  const filteredUsers = users;
  // const filteredUsers = clientSideSearchUsers(users, search);

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Players</Title>
      <Text>All players and team assignmnents.</Text>
      <Suspense>
      <Text color={'blue'}>Current Season: {currentSeason.name}</Text>
      <Text color={'blue'}>
        Start Date: {dateFormatter.format(currentSeason.start_date)}
      </Text>
      <Text color={'blue'}>
        End Date: {dateFormatter.format(currentSeason.end_date)}
        </Text>
      </Suspense>
      {/* <Search /> */}
      <Card className="mt-6">
        <Suspense>
        <UsersTable
          users={filteredUsers}
          teams={teams}
          teamAssignments={initialAssignments}
        />
        </Suspense>
      </Card>
    </main>
  );
}
