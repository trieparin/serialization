import {
  ConfirmDialog,
  PageTitle,
  Paginate,
  TableSearch,
  TableSelect,
} from '@/components';
import { admin, db } from '@/firebase/admin';
import { convertQuery } from '@/helpers/convert.helper';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import {
  DIALOG_ACTION,
  IFormAction,
  IFormDialog,
  PAGE_SIZE,
} from '@/models/form.model';
import { IItem, ITEM_TYPE } from '@/models/inventory.model';
import { ROLE } from '@/models/user.model';
import {
  Badge,
  IconButton,
  Pane,
  Table,
  TrashIcon,
  majorScale,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useCallback, useEffect, useReducer, useState } from 'react';

interface InventoryPageProps {
  data: IItem[];
  total: number;
}

export default function InventoryPage({ data, total }: InventoryPageProps) {
  const filterReducer = (state: object, action: IFormAction) => {
    const { type, payload } = action;
    switch (type) {
      case 'FILTER_NAME':
        return {
          ...state,
          name: payload,
        };
      case 'FILTER_TYPE':
        return {
          ...state,
          type: payload,
        };
      default:
        return { ...state };
    }
  };
  const [state, dispatch] = useReducer(filterReducer, {});

  const [items, setItems] = useState<IItem[]>(data);
  const defaultOption = {
    action: DIALOG_ACTION.DELETE,
    open: false,
    path: '',
    message: '',
  };
  const [dialogOption, setDialogOption] = useState<IFormDialog>(defaultOption);
  const [page, setPage] = useState(total);

  const debounceFilter = useCallback(() => {
    const timeout = setTimeout(() => {
      const query = convertQuery(state);
      if (query) filterItems(query);
      if (!query && Object.keys(state).length) getItems();
    }, 500);
    return () => clearTimeout(timeout);
  }, [state]);

  const getItems = async () => {
    const fch = customFetch();
    const { data, total }: InventoryPageProps = await fch.get('/items');
    setItems(data);
    setPage(total);
  };

  const filterItems = async (query: string) => {
    const fch = customFetch();
    const { data }: { data: IItem[] } = await fch.get(`/items/filter?${query}`);
    const total = Math.ceil(data.length / PAGE_SIZE.PER_PAGE);
    setItems(data);
    setPage(total);
  };

  const renderType = (type: string) => {
    if (type === ITEM_TYPE.REG_NO) {
      return <Badge color="red">{type}</Badge>;
    } else {
      return <Badge color="neutral">{type}</Badge>;
    }
  };

  useEffect(() => debounceFilter(), [debounceFilter]);

  return (
    <BaseLayout>
      <PageTitle title="All Items" link="/inventory/create" hasAddButton />
      <Pane overflowX="auto">
        <Table minWidth="max-content">
          <Table.Head
            minWidth={900}
            paddingRight={0}
            paddingY={majorScale(1)}
            alignItems="flex-start"
          >
            <Table.TextHeaderCell>
              Name
              <TableSearch
                placeholder="Name..."
                dispatch={(value) => {
                  dispatch({ type: 'FILTER_NAME', payload: value });
                }}
              />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>Note</Table.TextHeaderCell>
            <Table.TextHeaderCell>
              Type
              <TableSelect
                options={ITEM_TYPE}
                dispatch={(value) => {
                  dispatch({ type: 'FILTER_TYPE', payload: value });
                }}
              />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell flexBasis={200} flexShrink={0} flexGrow={0}>
              Actions
            </Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {items?.map(({ id, name, note, type }) => (
              <Table.Row key={id}>
                <Table.TextCell>{name}</Table.TextCell>
                <Table.TextCell>{note}</Table.TextCell>
                <Table.TextCell>{renderType(type)}</Table.TextCell>
                <Table.Cell flexBasis={200} flexShrink={0} flexGrow={0}>
                  <IconButton
                    type="button"
                    name="delete"
                    title="Delete"
                    intent="danger"
                    icon={TrashIcon}
                    onClick={() => {
                      setDialogOption({
                        action: DIALOG_ACTION.DELETE,
                        open: true,
                        path: `/items/${id}`,
                        message: `Confirm delete "${type} : ${name}"?`,
                      });
                    }}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Paginate
          update={(value: IItem[]) => setItems(value)}
          query={convertQuery(state)}
          path="/items"
          total={page}
          sort={false}
        />
      </Pane>
      <ConfirmDialog
        action={dialogOption.action}
        open={dialogOption.open}
        path={dialogOption.path}
        message={dialogOption.message}
        update={getItems}
        reset={() => setDialogOption(defaultOption)}
      />
    </BaseLayout>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (!role) return { redirect: { destination: '/' } };
    if (role !== ROLE.ADMIN) {
      return { redirect: { destination: '/no-permission' } };
    }

    const data: IItem[] = [];
    const snapshot = db.collection('items').orderBy('type');
    const amount = await snapshot.count().get();
    const total = Math.ceil(amount.data().count / PAGE_SIZE.PER_PAGE);
    const select = await snapshot.limit(PAGE_SIZE.PER_PAGE).get();
    select.forEach((doc) => {
      data.push({ id: doc.id, ...(doc.data() as IItem) });
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
