import { ConfirmDialog, PageTitle } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { UserContext } from '@/contexts/UserContext';
import { db } from '@/firebase/config';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { IUser } from '@/models/user.model';
import {
  EditIcon,
  IconButton,
  Pane,
  Table,
  TrashIcon,
  majorScale,
} from 'evergreen-ui';
import { collection, getDocs } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useContext, useState } from 'react';

export default function UserPage({ data }: { data: IUser[] }) {
  const { loading, startLoading, stopLoading } = useContext(LoadingContext);
  const { profile } = useContext(UserContext);
  const [users, setUsers] = useState(data);
  const [dialogOption, setDialogOption] = useState({
    open: false,
    uid: '',
    message: '',
  });

  const getAllUsers = async () => {
    const fch = customFetch();
    const { data }: any = await fch.get('/users');
    setUsers(data);
  };

  const openDialog = (uid: string, message: string) => {
    startLoading();
    setDialogOption({
      open: true,
      uid,
      message,
    });
    stopLoading();
  };

  return (
    <BaseLayout>
      <PageTitle title="All Users" link="/user/create" hasAddButton />
      <Table>
        <Table.Head paddingRight={0}>
          <Table.TextHeaderCell>No.</Table.TextHeaderCell>
          <Table.TextHeaderCell>Name</Table.TextHeaderCell>
          <Table.TextHeaderCell>Email</Table.TextHeaderCell>
          <Table.TextHeaderCell>Role</Table.TextHeaderCell>
          <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {users?.map(
            ({ uid, firstName, lastName, email, role }, index: number) => (
              <Table.Row key={uid}>
                <Table.TextCell>{index + 1}</Table.TextCell>
                <Table.TextCell>{`${firstName} ${lastName}`}</Table.TextCell>
                <Table.TextCell>{email}</Table.TextCell>
                <Table.TextCell>{role}</Table.TextCell>
                <Table.TextCell>
                  <Pane display="flex" columnGap={majorScale(1)}>
                    <Link href={`/user/info/${uid}`}>
                      <IconButton
                        type="button"
                        name="edit"
                        title="edit"
                        icon={EditIcon}
                      />
                    </Link>
                    <IconButton
                      type="button"
                      name="delete"
                      title="delete"
                      intent="danger"
                      icon={TrashIcon}
                      disabled={uid === profile.uid}
                      onClick={() => {
                        openDialog(
                          uid,
                          `Confirm delete "${firstName} ${lastName}"?`
                        );
                      }}
                    />
                  </Pane>
                </Table.TextCell>
              </Table.Row>
            )
          )}
        </Table.Body>
      </Table>
      <ConfirmDialog
        approve={false}
        open={dialogOption.open}
        loading={loading}
        message={dialogOption.message}
        path={`/users/${dialogOption.uid}`}
        update={getAllUsers}
        reset={() => setDialogOption({ open: false, uid: '', message: '' })}
      />
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
