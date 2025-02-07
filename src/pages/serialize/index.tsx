import {
  ConfirmDialog,
  DistributeDialog,
  PageTitle,
  Paginate,
  SerialInfo,
  TableSearch,
  TableSelect,
} from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { admin, db } from '@/firebase/admin';
import { convertQuery, downloadFile } from '@/helpers/convert.helper';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import {
  DIALOG_ACTION,
  IFormAction,
  IFormDialog,
  PAGE_SIZE,
} from '@/models/form.model';
import { IProduct } from '@/models/product.model';
import { ISerialize, SERIALIZE_STATUS } from '@/models/serialize.model';
import { ROLE } from '@/models/user.model';
import {
  Badge,
  BoxIcon,
  CompressedIcon,
  Dialog,
  EndorsedIcon,
  IconButton,
  LabelIcon,
  Pane,
  Switch,
  Table,
  Text,
  TrashIcon,
  majorScale,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';

interface SerializePageProps {
  data: ISerialize[];
  total: number;
}

export default function SerializePage({ data, total }: SerializePageProps) {
  const filterReducer = (state: object, action: IFormAction) => {
    const { type, payload } = action;
    switch (type) {
      case 'FILTER_LABEL':
        return {
          ...state,
          label: payload,
        };
      case 'FILTER_STATUS':
        return {
          ...state,
          status: payload,
        };
      default:
        return { ...state };
    }
  };
  const [state, dispatch] = useReducer(filterReducer, {});

  const profile = useContext(UserContext);
  const [serials, setSerials] = useState<ISerialize[]>(data);
  const defaultOption = {
    action: DIALOG_ACTION.DELETE,
    open: false,
    path: '',
    message: '',
  };
  const [dialogOption, setDialogOption] = useState<IFormDialog>(defaultOption);
  const [distOption, setDistOption] = useState<IFormDialog>(defaultOption);
  const [serialInfo, setSerialInfo] = useState({
    open: false,
    label: '',
    serials: [''],
  });
  const [sort, setSort] = useState(false);
  const [page, setPage] = useState(total);

  const debounceFilter = useCallback(() => {
    const timeout = setTimeout(() => {
      const query = convertQuery(state);
      if (query) filterSerials(query);
      if (!query && Object.keys(state).length) getSerials();
    }, 500);
    return () => clearTimeout(timeout);
  }, [state]);

  const getSerials = async (sort?: boolean) => {
    const fch = customFetch();
    const { data, total }: SerializePageProps = await fch.get(
      `/serials?sort=${sort ? 'created' : 'updated'}`
    );
    setSerials(data);
    setPage(total);
  };

  const filterSerials = async (query: string) => {
    const fch = customFetch();
    const { data }: { data: ISerialize[] } = await fch.get(
      `/serials/filter?${query}`
    );
    const total = Math.ceil(data.length / PAGE_SIZE.PER_PAGE);
    setSerials(data);
    setPage(total);
  };

  const downloadSerials = async (serial: ISerialize) => {
    const data: Record<string, object> = { serial };
    const fch = customFetch();
    const { data: product }: { data: IProduct } = await fch.get(
      `/products/${serial.product}`
    );
    data.product = product;
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const objUrl = URL.createObjectURL(blob);
    downloadFile(objUrl, `${product.batch}_${product.name}.json`);
    URL.revokeObjectURL(objUrl);
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case SERIALIZE_STATUS.LABELED:
        return <Badge color="orange">{status}</Badge>;
      case SERIALIZE_STATUS.VERIFIED:
        return <Badge color="purple">{status}</Badge>;
      default:
        return <Badge color="teal">{status}</Badge>;
    }
  };

  useEffect(() => debounceFilter(), [debounceFilter]);

  return (
    <BaseLayout>
      <PageTitle title="All Serials" />
      <Pane overflowX="auto">
        <Table minWidth="max-content">
          <Table.Head
            minWidth={900}
            paddingRight={0}
            paddingY={majorScale(1)}
            alignItems="flex-start"
          >
            <Table.TextHeaderCell>
              Label
              <TableSearch
                placeholder="Label..."
                dispatch={(value) => {
                  dispatch({ type: 'FILTER_LABEL', payload: value });
                }}
              />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>Serial Amounts</Table.TextHeaderCell>
            <Table.TextHeaderCell>
              Status
              <TableSelect
                options={SERIALIZE_STATUS}
                dispatch={(value) => {
                  dispatch({ type: 'FILTER_STATUS', payload: value });
                }}
              />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell
              flexBasis={200}
              flexShrink={0}
              flexGrow={0}
            >
              Actions
            </Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {serials.map((serial) => (
              <Table.Row key={serial.id}>
                <Table.TextCell>{serial.label}</Table.TextCell>
                <Table.TextCell>{serial.serials.length}</Table.TextCell>
                <Table.TextCell>{renderStatus(serial.status)}</Table.TextCell>
                <Table.Cell
                  flexBasis={200}
                  flexShrink={0}
                  flexGrow={0}
                >
                  <Pane
                    display="flex"
                    columnGap={majorScale(1)}
                  >
                    <IconButton
                      type="button"
                      name="info"
                      title="Info"
                      icon={LabelIcon}
                      onClick={() => {
                        setSerialInfo({
                          open: true,
                          label: serial.label,
                          serials: serial.serials,
                        });
                      }}
                    />
                    {profile.role === ROLE.SUPERVISOR && (
                      <>
                        <IconButton
                          type="button"
                          name="download"
                          title="Download"
                          icon={CompressedIcon}
                          disabled={serial.status === SERIALIZE_STATUS.LABELED}
                          onClick={() => downloadSerials(serial)}
                        />
                        <IconButton
                          type="button"
                          name="verify"
                          title="Verify"
                          intent="success"
                          icon={EndorsedIcon}
                          disabled={serial.status !== SERIALIZE_STATUS.LABELED}
                          onClick={() => {
                            setDialogOption({
                              action: DIALOG_ACTION.UPDATE,
                              open: true,
                              path: `/serials/${serial.id}`,
                              message: `Verify "${serial.label}"?`,
                              confirm: true,
                              change: { status: SERIALIZE_STATUS.VERIFIED },
                            });
                          }}
                        />
                        <IconButton
                          type="button"
                          name="delete"
                          title="Delete"
                          intent="danger"
                          icon={TrashIcon}
                          disabled={
                            serial.status === SERIALIZE_STATUS.DISTRIBUTED
                          }
                          onClick={() => {
                            setDialogOption({
                              action: DIALOG_ACTION.DELETE,
                              open: true,
                              path: `/serials/${serial.id}`,
                              message: `Delete "${serial.label}"?`,
                            });
                          }}
                        />
                      </>
                    )}
                    {profile.role === ROLE.OPERATOR && (
                      <IconButton
                        type="button"
                        name="distribute"
                        title="Distribute"
                        intent="success"
                        icon={BoxIcon}
                        disabled={serial.status !== SERIALIZE_STATUS.VERIFIED}
                        onClick={() => {
                          setDistOption({
                            action: DIALOG_ACTION.CREATE,
                            open: true,
                            path: `/distributes`,
                            message: `Distribute "${serial.label}"?`,
                            change: {
                              product: serial.product,
                              serial: serial.id,
                            },
                          });
                        }}
                      />
                    )}
                  </Pane>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Pane
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Pane
            display="flex"
            alignItems="center"
          >
            <Text size={300}>Sort by create date:&nbsp;</Text>
            <Switch
              name="sort"
              title="Sort"
              hasCheckIcon
              checked={sort}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setSort(event.currentTarget.checked);
                getSerials(event.currentTarget.checked);
              }}
            />
          </Pane>
          <Paginate
            update={(value: ISerialize[]) => setSerials(value)}
            query={convertQuery(state)}
            path="/serials"
            total={page}
            sort={sort}
          />
        </Pane>
      </Pane>
      <ConfirmDialog
        action={dialogOption.action}
        open={dialogOption.open}
        path={dialogOption.path}
        message={dialogOption.message}
        confirm={dialogOption.confirm}
        change={dialogOption.change}
        redirect={dialogOption.redirect}
        update={getSerials}
        reset={() => setDialogOption(defaultOption)}
      />
      <DistributeDialog
        action={distOption.action}
        open={distOption.open}
        path={distOption.path}
        message={distOption.message}
        change={distOption.change}
        reset={() => setDistOption(defaultOption)}
      />
      <Dialog
        isShown={serialInfo.open}
        hasClose={false}
        hasCancel={false}
        title="Product Info"
        confirmLabel="Close"
        onCloseComplete={() => {
          setSerialInfo({ open: false, label: '', serials: [''] });
        }}
      >
        <SerialInfo
          label={serialInfo.label}
          serials={serialInfo.serials}
        />
      </Dialog>
    </BaseLayout>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (!role) return { redirect: { destination: '/' } };
    if (role === ROLE.ADMIN) {
      return { redirect: { destination: '/no-permission' } };
    }

    const data: ISerialize[] = [];
    const snapshot = db.collection('serials').orderBy('updated', 'desc');
    const amount = await snapshot.count().get();
    const total = Math.ceil(amount.data().count / PAGE_SIZE.PER_PAGE);
    const select = await snapshot.limit(PAGE_SIZE.PER_PAGE).get();
    select.forEach((doc) => {
      data.push({ id: doc.id, ...(doc.data() as ISerialize) });
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
