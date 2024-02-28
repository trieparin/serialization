import { PageTitle } from '@/components';
import { BaseLayout } from '@/layouts';
import { EditIcon, Pane, Table, TrashIcon, minorScale } from 'evergreen-ui';
import Link from 'next/link';

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
          {mockUsers.map(({ id, firstName, lastName, email, role }, index) => (
            <Table.Row key={id}>
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
          ))}
        </Table.Body>
      </Table>
    </BaseLayout>
  );
}
