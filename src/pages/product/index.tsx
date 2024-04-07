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
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { DialogAction, IFormDialog, PageSize } from '@/models/form.model';
import { IProduct, ProductStatus, ProductType } from '@/models/product.model';
import { SerializeStatus } from '@/models/serialize.model';
import { Role } from '@/models/user.model';
import {
  Badge,
  BarcodeIcon,
  Dialog,
  EditIcon,
  EndorsedIcon,
  IconButton,
  LabelIcon,
  Pane,
  Table,
  TrashIcon,
  majorScale,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';

interface ProductPageProps {
  data: IProduct[];
  total: number;
}

export default function ProductPage({ data, total }: ProductPageProps) {
  const init = {
    register: '',
    name: '',
    type: ProductType.NON_DRUG,
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
    status: ProductStatus.CREATED,
  };
  const router = useRouter();
  const profile = useContext(UserContext);
  const [products, setProducts] = useState<IProduct[]>(data);
  const [dialogOption, setDialogOption] = useState<IFormDialog>({
    action: DialogAction.DELETE,
    open: false,
    path: '',
    message: '',
  });
  const [viewInfo, setViewInfo] = useState({
    open: false,
    product: init,
  });

  const getAllProducts = async () => {
    const fch = customFetch();
    const { data }: { data: IProduct[] } = await fch.get('/products');
    setProducts(data);
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
      status: SerializeStatus.LABELED,
      serials,
    };
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case ProductStatus.CREATED:
        return <Badge color="yellow">{status}</Badge>;
      case ProductStatus.APPROVED:
        return <Badge color="blue">{status}</Badge>;
      default:
        return <Badge color="green">{status}</Badge>;
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="All Products" link="/product/create" hasAddButton />
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
              <TableSearch placeholder="Batch ID" find="batch" />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>
              Name
              <TableSearch placeholder="Name" find="name" />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>Size (Package)</Table.TextHeaderCell>
            <Table.TextHeaderCell>
              Status
              <TableSelect options={ProductStatus} />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell flexBasis={200} flexShrink={0} flexGrow={0}>
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
                <Table.Cell flexBasis={200} flexShrink={0} flexGrow={0}>
                  <Pane display="flex" columnGap={majorScale(1)}>
                    <IconButton
                      type="button"
                      name="edit"
                      title="edit"
                      icon={EditIcon}
                      disabled={product.status !== ProductStatus.CREATED}
                      onClick={() => router.push(`/product/info/${product.id}`)}
                    />
                    <IconButton
                      type="button"
                      name="info"
                      title="info"
                      icon={LabelIcon}
                      onClick={() => setViewInfo({ open: true, product })}
                    />
                    {profile.role === Role.OPERATOR ? (
                      <IconButton
                        type="button"
                        name="barcode"
                        title="barcode"
                        intent="success"
                        icon={BarcodeIcon}
                        disabled={product.status !== ProductStatus.APPROVED}
                        onClick={() => {
                          setDialogOption({
                            action: DialogAction.CREATE,
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
                          title="verify"
                          intent="success"
                          icon={EndorsedIcon}
                          disabled={product.status !== ProductStatus.CREATED}
                          onClick={() => {
                            setDialogOption({
                              action: DialogAction.UPDATE,
                              open: true,
                              path: `/products/${product.id}`,
                              message: `Approve "${product.batch} : ${product.name}"?`,
                              confirm: true,
                              change: { status: ProductStatus.APPROVED },
                            });
                          }}
                        />
                        <IconButton
                          type="button"
                          name="delete"
                          title="delete"
                          intent="danger"
                          icon={TrashIcon}
                          disabled={product.status === ProductStatus.SERIALIZED}
                          onClick={() => {
                            setDialogOption({
                              action: DialogAction.DELETE,
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
        <Paginate
          update={(value: IProduct[]) => setProducts(value)}
          path="/products"
          total={total}
        />
      </Pane>
      <ConfirmDialog
        action={dialogOption.action}
        open={dialogOption.open}
        path={dialogOption.path}
        message={dialogOption.message}
        confirm={dialogOption.confirm}
        change={dialogOption.change}
        redirect={dialogOption.redirect}
        update={getAllProducts}
        reset={() => {
          setDialogOption({
            action: DialogAction.DELETE,
            open: false,
            path: '',
            message: '',
          });
        }}
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
    if (role === Role.ADMIN) {
      return { redirect: { destination: '/no-permission' } };
    }

    const data: IProduct[] = [];
    const snapshot = db.collection('products');
    const select = await snapshot.limit(PageSize.PER_PAGE).get();
    const total = Math.ceil((await snapshot.get()).size / PageSize.PER_PAGE);
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
