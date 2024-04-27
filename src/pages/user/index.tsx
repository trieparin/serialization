import {
  ConfirmDialog,
  PageTitle,
  Paginate,
  TableSearch,
  TableSelect,
} from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { admin, db } from '@/firebase/admin';
import { convertQuery } from '@/helpers/convert.helper';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import {
  DialogAction,
  IFormAction,
  IFormDialog,
  PageSize,
} from '@/models/form.model';
import { IUser, IUserContext, Role } from '@/models/user.model';
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
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';

interface UserPageProps {
  data: IUser[];
  total: number;
}

export default function UserPage({ data, total }: UserPageProps) {
  const filterReducer = (state: object, action: IFormAction) => {
    const { type, payload } = action;
    switch (type) {
      case 'FILTER_EMAIL':
        return {
          ...state,
          email: payload,
        };
      case 'FILTER_ROLE':
        return {
          ...state,
          role: payload,
        };
      default:
        return { ...state };
    }
  };

  const router = useRouter();
  const profile = useContext(UserContext);
  const [users, setUsers] = useState<IUserContext[]>(data);
  const [dialogOption, setDialogOption] = useState<IFormDialog>({
    action: DialogAction.DELETE,
    open: false,
    path: '',
    message: '',
  });
  const [page, setPage] = useState(total);
  const [state, dispatch] = useReducer(filterReducer, {});

  const debounceFilter = useCallback(() => {
    const timeout = setTimeout(() => {
      const query = convertQuery(state);
      if (query) filterUsers(query);
      if (!query && Object.keys(state).length) getUsers();
    }, 500);
    return () => clearTimeout(timeout);
  }, [state]);

  const getUsers = async () => {
    const fch = customFetch();
    const { data, total }: UserPageProps = await fch.get('/users');
    setUsers(data);
    setPage(total);
  };

  const filterUsers = async (query: string) => {
    const fch = customFetch();
    const { data }: { data: IUser[] } = await fch.get(`/users/filter?${query}`);
    const total = Math.ceil(data.length / PageSize.PER_PAGE);
    setUsers(data);
    setPage(total);
  };

  const renderRole = (role: string) => {
    if (role === Role.ADMIN) {
      return <Badge color="red">{role}</Badge>;
    } else {
      return <Badge color="neutral">{role}</Badge>;
    }
  };

  useEffect(() => debounceFilter(), [debounceFilter]);

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
              <TableSearch
                placeholder="Email..."
                dispatch={(value) => {
                  dispatch({ type: 'FILTER_EMAIL', payload: value });
                }}
              />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>Name</Table.TextHeaderCell>
            <Table.TextHeaderCell>
              Role
              <TableSelect
                options={Role}
                dispatch={(value) => {
                  dispatch({ type: 'FILTER_ROLE', payload: value });
                }}
              />
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
                      title="Edit"
                      icon={EditIcon}
                      onClick={() => router.push(`/user/info/${uid}`)}
                    />
                    <IconButton
                      type="button"
                      name="delete"
                      title="Delete"
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
          query={convertQuery(state)}
          path="/users"
          total={page}
          sort={false}
        />
      </Pane>
      <ConfirmDialog
        action={dialogOption.action}
        open={dialogOption.open}
        path={dialogOption.path}
        message={dialogOption.message}
        update={getUsers}
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

    const data: IUserContext[] = [];
    const snapshot = db.collection('users').orderBy('role');
    const amount = await snapshot.count().get();
    const total = Math.ceil(amount.data().count / PageSize.PER_PAGE);
    const select = await snapshot.limit(PageSize.PER_PAGE).get();
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
