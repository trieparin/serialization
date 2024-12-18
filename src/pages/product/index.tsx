import {
  ConfirmDialog,
  PageTitle,
  Paginate,
  TableSearch,
  TableSelect,
  ViewInfo,
} from '@/components';
import { UserContext } from '@/contexts/UserContext';
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
import { IProduct, PRODUCT_STATUS, PRODUCT_TYPE } from '@/models/product.model';
import { SERIALIZE_STATUS } from '@/models/serialize.model';
import { ROLE } from '@/models/user.model';
import {
  Badge,
  BarcodeIcon,
  Dialog,
  EditIcon,
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
import { useRouter } from 'next/router';
import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';

interface ProductPageProps {
  data: IProduct[];
  total: number;
}

export default function ProductPage({ data, total }: ProductPageProps) {
  const init = {
    register: '',
    name: '',
    type: PRODUCT_TYPE.NON_DRUG,
    batch: '',
    size: 0,
    pack: '',
    dosage: '',
    amount: 0,
    unit: '',
    manufacturer: '',
    mfd: '',
    exp: '',
    ingredients: [{ ingredient: '', quantity: 0, uom: '' }],
    status: PRODUCT_STATUS.CREATED,
  };

  const filterReducer = (state: object, action: IFormAction) => {
    const { type, payload } = action;
    switch (type) {
      case 'FILTER_BATCH':
        return {
          ...state,
          batch: payload,
        };
      case 'FILTER_NAME':
        return {
          ...state,
          name: payload,
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

  const router = useRouter();
  const profile = useContext(UserContext);
  const [products, setProducts] = useState<IProduct[]>(data);
  const defaultOption = {
    action: DIALOG_ACTION.DELETE,
    open: false,
    path: '',
    message: '',
  };
  const [dialogOption, setDialogOption] = useState<IFormDialog>(defaultOption);
  const [viewInfo, setViewInfo] = useState({
    open: false,
    product: init,
  });
  const [sort, setSort] = useState(false);
  const [page, setPage] = useState(total);

  const debounceFilter = useCallback(() => {
    const timeout = setTimeout(() => {
      const query = convertQuery(state);
      if (query) filterProducts(query);
      if (!query && Object.keys(state).length) getProducts();
    }, 500);
    return () => clearTimeout(timeout);
  }, [state]);

  const getProducts = async (sort?: boolean) => {
    const fch = customFetch();
    const { data, total }: ProductPageProps = await fch.get(
      `/products?sort=${sort ? 'created' : 'updated'}`
    );
    setProducts(data);
    setPage(total);
  };

  const filterProducts = async (query: string) => {
    const fch = customFetch();
    const { data }: { data: IProduct[] } = await fch.get(
      `/products/filter?${query}`
    );
    const total = Math.ceil(data.length / PAGE_SIZE.PER_PAGE);
    setProducts(data);
    setPage(total);
  };

  const generateSerial = (batch: string) => {
    const date = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 9);
    const bid = batch.replace(/[^a-zA-Z0-9]/, '').substring(0, 3);
    return `SZ${date}${bid}${rand}`.toUpperCase();
  };

  const serializeProduct = (
    id: string,
    name: string,
    batch: string,
    amount: number
  ) => {
    const serials = Array.from({ length: amount }, () => generateSerial(batch));
    return {
      product: id,
      label: `${batch} : ${name}`,
      status: SERIALIZE_STATUS.LABELED,
      serials,
    };
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case PRODUCT_STATUS.CREATED:
        return <Badge color="yellow">{status}</Badge>;
      case PRODUCT_STATUS.APPROVED:
        return <Badge color="blue">{status}</Badge>;
      default:
        return <Badge color="green">{status}</Badge>;
    }
  };

  useEffect(() => debounceFilter(), [debounceFilter]);

  return (
    <BaseLayout>
      <PageTitle
        title="All Products"
        link="/product/create"
        hasAddButton
      />
      <Pane overflowX="auto">
        <Table minWidth="max-content">
          <Table.Head
            minWidth={900}
            paddingRight={0}
            paddingY={majorScale(1)}
            alignItems="flex-start"
          >
            <Table.TextHeaderCell>
              Batch ID
              <TableSearch
                placeholder="Batch ID..."
                dispatch={(value) => {
                  dispatch({ type: 'FILTER_BATCH', payload: value });
                }}
                hidden={!state.batch && !!state.name}
              />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>
              Name
              <TableSearch
                placeholder="Name..."
                dispatch={(value) => {
                  dispatch({ type: 'FILTER_NAME', payload: value });
                }}
                hidden={!state.name && !!state.batch}
              />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>Size (Package)</Table.TextHeaderCell>
            <Table.TextHeaderCell>
              Status
              <TableSelect
                options={PRODUCT_STATUS}
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
            {products.map((product) => (
              <Table.Row key={product.id}>
                <Table.TextCell>{product.batch}</Table.TextCell>
                <Table.TextCell>{product.name}</Table.TextCell>
                <Table.TextCell>{`${product.size} (${product.pack})`}</Table.TextCell>
                <Table.TextCell>{renderStatus(product.status)}</Table.TextCell>
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
                      name="edit"
                      title="Edit"
                      icon={EditIcon}
                      disabled={product.status !== PRODUCT_STATUS.CREATED}
                      onClick={() => router.push(`/product/info/${product.id}`)}
                    />
                    <IconButton
                      type="button"
                      name="info"
                      title="Info"
                      icon={LabelIcon}
                      onClick={() => setViewInfo({ open: true, product })}
                    />
                    {profile.role === ROLE.OPERATOR ? (
                      <IconButton
                        type="button"
                        name="barcode"
                        title="Barcode"
                        intent="success"
                        icon={BarcodeIcon}
                        disabled={product.status !== PRODUCT_STATUS.APPROVED}
                        onClick={() => {
                          setDialogOption({
                            action: DIALOG_ACTION.CREATE,
                            open: true,
                            path: '/serials',
                            message: `Serialize "${product.batch} : ${product.name}"?`,
                            confirm: true,
                            change: serializeProduct(
                              product.id!,
                              product.name,
                              product.batch,
                              product.size
                            ),
                            redirect: '/serialize',
                          });
                        }}
                      />
                    ) : (
                      <>
                        <IconButton
                          type="button"
                          name="verify"
                          title="Verify"
                          intent="success"
                          icon={EndorsedIcon}
                          disabled={product.status !== PRODUCT_STATUS.CREATED}
                          onClick={() => {
                            setDialogOption({
                              action: DIALOG_ACTION.UPDATE,
                              open: true,
                              path: `/products/${product.id}`,
                              message: `Approve "${product.batch} : ${product.name}"?`,
                              confirm: true,
                              change: { status: PRODUCT_STATUS.APPROVED },
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
                            product.status === PRODUCT_STATUS.SERIALIZED
                          }
                          onClick={() => {
                            setDialogOption({
                              action: DIALOG_ACTION.DELETE,
                              open: true,
                              path: `/products/${product.id}`,
                              message: `Delete "${product.batch} : ${product.name}"?`,
                            });
                          }}
                        />
                      </>
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
                getProducts(event.currentTarget.checked);
              }}
            />
          </Pane>
          <Paginate
            update={(value: IProduct[]) => setProducts(value)}
            query={convertQuery(state)}
            path="/products"
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
        update={getProducts}
        reset={() => setDialogOption(defaultOption)}
      />
      <Dialog
        isShown={viewInfo.open}
        hasClose={false}
        hasCancel={false}
        title="Product Info"
        confirmLabel="Close"
        onCloseComplete={() => setViewInfo({ open: false, product: init })}
      >
        <ViewInfo product={viewInfo.product} />
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

    const data: IProduct[] = [];
    const snapshot = db.collection('products').orderBy('updated', 'desc');
    const amount = await snapshot.count().get();
    const total = Math.ceil(amount.data().count / PAGE_SIZE.PER_PAGE);
    const select = await snapshot.limit(PAGE_SIZE.PER_PAGE).get();
    select.forEach((doc) => {
      data.push({ id: doc.id, ...(doc.data() as IProduct) });
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
