import { ConfirmDialog, PageTitle, TableSearch, ViewInfo } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { admin, db } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { DialogAction, IFormDialog } from '@/models/form.model';
import { IProduct, ProductStatus } from '@/models/product.model';
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

export default function ProductPage({ data }: { data: IProduct[] }) {
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
    id: '',
  });

  const getAllProducts = async () => {
    const fch = customFetch();
    const { data }: { data: IProduct[] } = await fch.get('/products');
    setProducts(data);
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

  const openInfo = async (id: string) => {
    setViewInfo({ open: true, id });
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

  return (
    <BaseLayout>
      <PageTitle title="All Products" link="/product/create" hasAddButton />
      <Pane overflowX="auto">
        <Table minWidth="max-content">
          <Table.Head minWidth={900} paddingRight={0}>
            <TableSearch
              placeholder="SEARCH BATCH ID"
              path="/products"
              find="batch"
              update={(search: IProduct[]) => setProducts(search)}
              reset={getAllProducts}
            />
            <Table.TextHeaderCell>Name</Table.TextHeaderCell>
            <Table.TextHeaderCell>Size (Package)</Table.TextHeaderCell>
            <Table.TextHeaderCell>Status</Table.TextHeaderCell>
            <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {products.map(({ id, batch, name, size, pack, status }) => (
              <Table.Row key={id}>
                <Table.TextCell>{batch}</Table.TextCell>
                <Table.TextCell>{name}</Table.TextCell>
                <Table.TextCell>{`${size} (${pack})`}</Table.TextCell>
                <Table.TextCell>{renderStatus(status)}</Table.TextCell>
                <Table.Cell>
                  <Pane display="flex" columnGap={majorScale(1)}>
                    <IconButton
                      type="button"
                      name="edit"
                      title="edit"
                      icon={EditIcon}
                      disabled={status !== ProductStatus.CREATED}
                      onClick={() => router.push(`/product/info/${id}`)}
                    />
                    <IconButton
                      type="button"
                      name="info"
                      title="info"
                      icon={LabelIcon}
                      onClick={() => openInfo(id!)}
                    />
                    {profile.role === Role.OPERATOR ? (
                      <IconButton
                        type="button"
                        name="barcode"
                        title="barcode"
                        intent="success"
                        icon={BarcodeIcon}
                        disabled={status !== ProductStatus.APPROVED}
                        onClick={() => {
                          setDialogOption({
                            action: DialogAction.CREATE,
                            open: true,
                            path: '/serials',
                            message: `Serialize "${batch} : ${name}"?`,
                            confirm: true,
                            change: serializeProduct(id!, name, batch, size),
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
                          disabled={status !== ProductStatus.CREATED}
                          onClick={() => {
                            setDialogOption({
                              action: DialogAction.UPDATE,
                              open: true,
                              path: `/products/${id}`,
                              message: `Approve "${batch} : ${name}"?`,
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
                          disabled={status === ProductStatus.SERIALIZED}
                          onClick={() => {
                            setDialogOption({
                              action: DialogAction.DELETE,
                              open: true,
                              path: `/products/${id}`,
                              message: `Delete "${batch} : ${name}"?`,
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
        onCloseComplete={() => setViewInfo({ open: false, id: '' })}
      >
        <ViewInfo id={viewInfo.id} />
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
    const snapshot = await db.collection('products').get();
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...(doc.data() as IProduct) });
    });

    return {
      props: {
        data,
      },
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
