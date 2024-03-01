import { PageTitle } from '@/components';
import { BaseLayout } from '@/layouts';
import { EditIcon, Pane, Table, TrashIcon, minorScale } from 'evergreen-ui';
import Link from 'next/link';
import { useState } from 'react';

const mockUsers = [
  {
    id: 1,
    firstName: 'Hello',
    lastName: 'World',
    email: 'hello.world@mail.com',
    role: 'Admin',
  },
  {
    id: 2,
    firstName: 'Hello',
    lastName: 'World',
    email: 'hello.world@mail.com',
    role: 'Supervisor',
  },
];

export default function UserPage() {
  const [allUsers, setAllUsers] = useState<any>([]);
  // useMemo(() => {
  //   const fetchUsers = async () => {
  //     const users = await getAllUsers();
  //     setAllUsers(users);
  //   };
  //   fetchUsers();
  // }, [allUsers]);
  return (
    <BaseLayout>
      <PageTitle title="Manage Users" link="/user/create" hasAddButton />
      <Table>
        <Table.Head paddingRight="0">
          <Table.TextHeaderCell>No.</Table.TextHeaderCell>
          <Table.TextHeaderCell>Name</Table.TextHeaderCell>
          <Table.TextHeaderCell>Email</Table.TextHeaderCell>
          <Table.TextHeaderCell>Role</Table.TextHeaderCell>
          <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {allUsers.map(
            ({ uid, firstName, lastName, email, role }: any, index: number) => (
              <Table.Row key={uid}>
                <Table.TextCell>{index + 1}</Table.TextCell>
                <Table.TextCell>{`${firstName} ${lastName}`}</Table.TextCell>
                <Table.TextCell>{email}</Table.TextCell>
                <Table.TextCell>{role}</Table.TextCell>
                <Table.TextCell>
                  <Pane display="flex" columnGap={minorScale(3)}>
                    <Link href="/user/edit">
                      <EditIcon color="dark" cursor="pointer" />
                    </Link>
                    <TrashIcon color="red" cursor="pointer" />
                  </Pane>
                </Table.TextCell>
              </Table.Row>
            )
          )}
        </Table.Body>
      </Table>
    </BaseLayout>
  );
}
