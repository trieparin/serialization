import { PageTitle } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { UserContext } from '@/contexts/UserContext';
import { db } from '@/firebase/config';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { IUser } from '@/models/user.model';
import {
  Dialog,
  EditIcon,
  IconButton,
  Pane,
  Table,
  TrashIcon,
  majorScale,
  toaster,
} from 'evergreen-ui';
import { collection, getDocs } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useContext, useState } from 'react';

export default function UserPage({ data }: any) {
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);
  const { profile } = useContext(UserContext);
  const [users, setUsers] = useState<IUser[]>(data);
  const [dialogOption, setDialogOption] = useState({
    open: false,
    message: '',
    uid: '',
  });

  const getAllUsers = async () => {
    const fch = customFetch();
    const { data }: any = await fch.get('/users');
    setUsers(data);
  };

  const handleDelete = async (close: () => void) => {
    startLoading();
    try {
      const fch = customFetch();
      const { message }: any = await fch.del(`/users/${dialogOption.uid}`);
      toaster.success(message);
      getAllUsers();
    } catch (error) {
      toaster.danger('An error occurred');
    }
    stopLoading();
    close();
  };

  return (
    <BaseLayout>
      <PageTitle title="All Users" link="/user/create" hasAddButton />
      <Table>
        <Table.Head paddingRight="0">
          <Table.TextHeaderCell>No.</Table.TextHeaderCell>
          <Table.TextHeaderCell>Name</Table.TextHeaderCell>
          <Table.TextHeaderCell>Email</Table.TextHeaderCell>
          <Table.TextHeaderCell>Role</Table.TextHeaderCell>
          <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {users?.map(
            ({ uid, firstName, lastName, email, role }: any, index: number) => (
              <Table.Row key={uid}>
                <Table.TextCell>{index + 1}</Table.TextCell>
                <Table.TextCell>{`${firstName} ${lastName}`}</Table.TextCell>
                <Table.TextCell>{email}</Table.TextCell>
                <Table.TextCell>{role}</Table.TextCell>
                <Table.TextCell>
                  <Pane display="flex" columnGap={majorScale(1)}>
                    <Link href={`/user/info/${uid}`}>
                      <IconButton icon={EditIcon} />
                    </Link>
                    <IconButton
                      intent="danger"
                      icon={TrashIcon}
                      disabled={uid === profile.uid}
                      onClick={() =>
                        setDialogOption({
                          open: true,
                          message: `Confirm delete "${firstName} ${lastName}"?`,
                          uid,
                        })
                      }
                    />
                  </Pane>
                </Table.TextCell>
              </Table.Row>
            )
          )}
        </Table.Body>
      </Table>
      <Dialog
        isShown={dialogOption.open}
        hasClose={false}
        title="Confirmation"
        intent="danger"
        confirmLabel="Delete"
        isConfirmLoading={isLoading}
        onConfirm={(close) => handleDelete(close)}
        onCloseComplete={() =>
          setDialogOption({
            open: false,
            message: '',
            uid: '',
          })
        }
      >
        {dialogOption.message}
      </Dialog>
    </BaseLayout>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const token = req.cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  const snapshot = await getDocs(collection(db, 'users'));
  const data: IUser[] = [];
  snapshot.forEach((doc) => {
    data.push({
      uid: doc.id,
      ...doc.data(),
    });
  });
  return {
    props: {
      data,
    },
  };
}
