import {
  ConfirmDialog,
  PageTitle,
  Paginate,
  TableSearch,
  TableSelect,
} from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { admin, db } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { DialogAction, IFormDialog, PageSize } from '@/models/form.model';
import { IUser, Role } from '@/models/user.model';
import {
  Badge,
  EditIcon,
  IconButton,
  Pane,
  Table,
  TrashIcon,
  majorScale,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';

interface UserPageProps {
  data: IUser[];
  total: number;
}

export default function UserPage({ data, total }: UserPageProps) {
  const router = useRouter();
  const profile = useContext(UserContext);
  const [users, setUsers] = useState<IUser[]>(data);
  const [dialogOption, setDialogOption] = useState<IFormDialog>({
    action: DialogAction.DELETE,
    open: false,
    path: '',
    message: '',
  });

  const getAllUsers = async () => {
    const fch = customFetch();
    const { data }: { data: IUser[] } = await fch.get('/users');
    setUsers(data);
  };

  const renderRole = (role: string) => {
    if (role === Role.ADMIN) {
      return <Badge color="red">{role}</Badge>;
    } else {
      return <Badge color="neutral">{role}</Badge>;
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="All Users" link="/user/create" hasAddButton />
      <Pane overflowX="auto">
        <Table minWidth="max-content">
          <Table.Head
            minWidth={900}
            paddingRight={0}
            paddingY={majorScale(1)}
            alignItems="flex-start"
          >
            <Table.TextHeaderCell>
              Email
              <TableSearch placeholder="Email" find="email" />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>
              Name
              <TableSearch placeholder="Name" find="name" />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>
              Role
              <TableSelect options={Role} />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell flexBasis={200} flexShrink={0} flexGrow={0}>
              Actions
            </Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {users?.map(({ uid, email, firstName, lastName, role }) => (
              <Table.Row key={uid}>
                <Table.TextCell>{email}</Table.TextCell>
                <Table.TextCell>{`${firstName} ${lastName}`}</Table.TextCell>
                <Table.TextCell>{renderRole(role!)}</Table.TextCell>
                <Table.Cell flexBasis={200} flexShrink={0} flexGrow={0}>
                  <Pane display="flex" columnGap={majorScale(1)}>
                    <IconButton
                      type="button"
                      name="edit"
                      title="edit"
                      icon={EditIcon}
                      onClick={() => router.push(`/user/info/${uid}`)}
                    />
                    <IconButton
                      type="button"
                      name="delete"
                      title="delete"
                      intent="danger"
                      icon={TrashIcon}
                      disabled={uid === profile.uid}
                      onClick={() => {
                        setDialogOption({
                          action: DialogAction.DELETE,
                          open: true,
                          path: `/users/${uid}`,
                          message: `Confirm delete "${firstName} ${lastName}"?`,
                        });
                      }}
                    />
                  </Pane>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Paginate
          update={(value: IUser[]) => setUsers(value)}
          path="/users"
          total={total}
        />
      </Pane>
      <ConfirmDialog
        action={dialogOption.action}
        open={dialogOption.open}
        path={dialogOption.path}
        message={dialogOption.message}
        update={getAllUsers}
        reset={() =>
          setDialogOption({
            action: DialogAction.DELETE,
            open: false,
            path: '',
            message: '',
          })
        }
      />
    </BaseLayout>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (!role) return { redirect: { destination: '/' } };
    if (role !== Role.ADMIN) {
      return { redirect: { destination: '/no-permission' } };
    }

    const data: IUser[] = [];
    const snapshot = db.collection('users').orderBy('role');
    const select = await snapshot.limit(PageSize.PER_PAGE).get();
    const total = Math.ceil((await snapshot.get()).size / PageSize.PER_PAGE);
    select.forEach((doc) => {
      data.push({ uid: doc.id, ...doc.data() });
    });

    return {
      props: {
        data,
        total,
      },
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
