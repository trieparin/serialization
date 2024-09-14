import { PageTitle, Paginate, TableSearch } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { admin, db } from '@/firebase/admin';
import { convertQuery } from '@/helpers/convert.helper';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { IDistribute } from '@/models/distribute.model';
import { IFormAction, PAGE_SIZE } from '@/models/form.model';
import { ROLE } from '@/models/user.model';
import {
  CompressedIcon,
  Dialog,
  HelperManagementIcon,
  IconButton,
  Pane,
  Switch,
  Table,
  Text,
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
import QRCode from 'react-qr-code';

interface DistributePageProps {
  data: IDistribute[];
  total: number;
}

export default function DistributePage({ data, total }: DistributePageProps) {
  const filterReducer = (state: object, action: IFormAction) => {
    const { type, payload } = action;
    switch (type) {
      case 'FILTER_LABEL':
        return {
          ...state,
          label: payload,
        };
      default:
        return { ...state };
    }
  };
  const [state, dispatch] = useReducer(filterReducer, {});

  const profile = useContext(UserContext);
  const [distributes, setDistributes] = useState<IDistribute[]>(data);
  const [qrInfo, setQRInfo] = useState({ open: false, id: '' });
  const [sort, setSort] = useState(false);
  const [page, setPage] = useState(total);

  const debounceFilter = useCallback(() => {
    const timeout = setTimeout(() => {
      const query = convertQuery(state);
      if (query) filterDistributes(query);
      if (!query && Object.keys(state).length) getDistributes();
    }, 500);
    return () => clearTimeout(timeout);
  }, [state]);

  const getDistributes = async (sort?: boolean) => {
    const fch = customFetch();
    const { data, total }: DistributePageProps = await fch.get(
      `/distributes?sort=${sort ? 'created' : 'updated'}`
    );
    setDistributes(data);
    setPage(total);
  };

  const filterDistributes = async (query: string) => {
    const fch = customFetch();
    const { data }: { data: IDistribute[] } = await fch.get(
      `/distributes/filter?${query}`
    );
    const total = Math.ceil(data.length / PAGE_SIZE.PER_PAGE);
    setDistributes(data);
    setPage(total);
  };

  const downloadDistributes = async (distribute: IDistribute) => {
    const { label } = distribute;
    const json = JSON.stringify(distribute);
    const blob = new Blob([json], { type: 'application/json' });
    const objUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objUrl;
    anchor.download = `${label}.json`;
    anchor.click();
    URL.revokeObjectURL(objUrl);
  };

  useEffect(() => debounceFilter(), [debounceFilter]);

  return (
    <BaseLayout>
      <PageTitle title="All Distributions" />
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
            <Table.TextHeaderCell>Contract</Table.TextHeaderCell>
            <Table.TextHeaderCell flexBasis={200} flexShrink={0} flexGrow={0}>
              Actions
            </Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {distributes.map((dist) => (
              <Table.Row key={dist.id}>
                <Table.TextCell>{dist.label}</Table.TextCell>
                <Table.TextCell>{dist.contract}</Table.TextCell>
                <Table.Cell flexBasis={200} flexShrink={0} flexGrow={0}>
                  <Pane display="flex" columnGap={majorScale(1)}>
                    {profile.role === ROLE.SUPERVISOR && (
                      <IconButton
                        type="button"
                        name="download"
                        title="Download"
                        icon={CompressedIcon}
                        onClick={() => downloadDistributes(dist)}
                      />
                    )}
                    <IconButton
                      type="button"
                      name="qr-code"
                      title="QR Code"
                      intent="success"
                      icon={HelperManagementIcon}
                      onClick={() => setQRInfo({ open: true, id: dist.id! })}
                    />
                  </Pane>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Pane display="flex" alignItems="center" justifyContent="space-between">
          <Pane display="flex" alignItems="center">
            <Text size={300}>Sort by create date:&nbsp;</Text>
            <Switch
              name="sort"
              title="Sort"
              hasCheckIcon
              checked={sort}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setSort(event.currentTarget.checked);
                getDistributes(event.currentTarget.checked);
              }}
            />
          </Pane>
          <Paginate
            update={(value: IDistribute[]) => setDistributes(value)}
            query={convertQuery(state)}
            path="/serials"
            total={page}
            sort={sort}
          />
        </Pane>
      </Pane>
      <Dialog
        isShown={qrInfo.open}
        hasClose={false}
        title="Download or Scan QR"
        intent="success"
        confirmLabel="Download"
        onCloseComplete={() => setQRInfo({ open: false, id: '' })}
      >
        <Pane textAlign="center">
          <QRCode value={`/distribute/${qrInfo.id}`} />
        </Pane>
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

    const data: IDistribute[] = [];
    const snapshot = db.collection('distributes').orderBy('updated', 'desc');
    const amount = await snapshot.count().get();
    const total = Math.ceil(amount.data().count / PAGE_SIZE.PER_PAGE);
    const select = await snapshot.limit(PAGE_SIZE.PER_PAGE).get();
    select.forEach((doc) => {
      data.push({ id: doc.id, ...(doc.data() as IDistribute) });
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
