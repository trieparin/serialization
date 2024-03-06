import { PageTitle } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { IUser } from '@/models/user.model';
import {
  Dialog,
  EditIcon,
  Pane,
  Table,
  TrashIcon,
  minorScale,
  toaster,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';

export default function UserPage() {
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);
  const [users, setUsers] = useState<IUser[]>([]);
  const [dialogOption, setDialogOption] = useState({
    open: false,
    message: '',
    uid: '',
  });

  useEffect(() => {
    allUsers();
    stopLoading();
  }, [isLoading]);

  const allUsers = async () => {
    try {
      const fch = customFetch();
      const { data }: any = await fch.get('/users');
      setUsers(data);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (close: () => void) => {
    try {
      startLoading();
      const fch = customFetch();
      const { message }: any = await fch.del(`/users/${dialogOption.uid}`);
      toaster.success(message);
    } catch (error) {
      toaster.danger('An error occurred');
    }
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
                  <Pane display="flex" columnGap={minorScale(3)}>
                    <Link href={`/user/info/${uid}`}>
                      <EditIcon color="dark" cursor="pointer" />
                    </Link>
                    <TrashIcon
                      color="red"
                      cursor="pointer"
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

export function getServerSideProps({ req }: GetServerSidePropsContext) {
  const token = req.cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  return {
    props: {},
  };
}
