import { PageTitle } from '@/components';
import { BaseLayout } from '@/layouts';
import { IUser } from '@/models/user.model';
import { EditIcon, Pane, Table, TrashIcon, minorScale } from 'evergreen-ui';
import Link from 'next/link';

export default function UserPage() {
  const users: IUser[] = [];
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
          {users.map(
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
