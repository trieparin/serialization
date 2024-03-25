import { ConfirmDialog, PageTitle, ViewInfo } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { admin, db } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { DialogAction, IFormDialog, IFormMessage } from '@/models/form.model';
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
  toaster,
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
    const math = Math.random().toString(36).substring(2, 12);
    const generalize = batch.replace(/[^a-zA-Z0-9]/, '').substring(0, 4);
    return `SZ${generalize}${date}${math}`.toUpperCase();
  };

  const serializeProduct = async (
    id: string,
    name: string,
    batch: string,
    amount: number
  ) => {
    try {
      const serials = Array.from({ length: amount }, () =>
        generateSerial(batch)
      );
      const fch = customFetch();
      const { message }: IFormMessage = await fch.post('/serials', {
        product: id,
        status: SerializeStatus.LABELED,
        label: `${batch} : ${name}`,
        serials,
      });
      toaster.success(message);
      router.push('/serialize');
    } catch (e) {
      toaster.danger('An error occurred');
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="All Products" link="/product/create" hasAddButton />
      <Pane overflowX="auto">
        <Table minWidth="max-content">
          <Table.Head minWidth={1214} paddingRight={0}>
            <Table.TextHeaderCell>No.</Table.TextHeaderCell>
            <Table.TextHeaderCell>Batch ID</Table.TextHeaderCell>
            <Table.TextHeaderCell>Name</Table.TextHeaderCell>
            <Table.TextHeaderCell>Size (Container)</Table.TextHeaderCell>
            <Table.TextHeaderCell>Status</Table.TextHeaderCell>
            <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {products.map(
              ({ id, batch, name, size, container, status }, index) => (
                <Table.Row key={id}>
                  <Table.TextCell>{index + 1}</Table.TextCell>
                  <Table.TextCell>{batch}</Table.TextCell>
                  <Table.TextCell>{name}</Table.TextCell>
                  <Table.TextCell>{`${size} (${container})`}</Table.TextCell>
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
                          onClick={() =>
                            serializeProduct(id!, name, batch, size)
                          }
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
                                message: `Confirm approve "${batch} : ${name}"?`,
                                approve: true,
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
                                message: `Confirm delete "${batch} : ${name}"?`,
                                approve: false,
                                change: {},
                              });
                            }}
                          />
                        </>
                      )}
                    </Pane>
                  </Table.Cell>
                </Table.Row>
              )
            )}
          </Table.Body>
        </Table>
      </Pane>
      <ConfirmDialog
        action={dialogOption.action}
        open={dialogOption.open}
        path={dialogOption.path}
        message={dialogOption.message}
        approve={dialogOption.approve}
        change={dialogOption.change}
        update={getAllProducts}
        reset={() => {
          setDialogOption({
            action: DialogAction.DELETE,
            open: false,
            path: '',
            message: '',
            approve: false,
            change: {},
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
