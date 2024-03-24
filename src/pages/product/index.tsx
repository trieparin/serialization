import { ConfirmDialog, PageTitle, ProductInfo } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { admin, db } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { IProduct, ProductStatus } from '@/models/product.model';
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
  const [dialogOption, setDialogOption] = useState({
    open: false,
    approve: false,
    id: '',
    message: '',
    status: '',
  });
  const [productInfo, setProductInfo] = useState({
    open: false,
    id: '',
  });

  const getAllProducts = async () => {
    const fch = customFetch();
    const { data }: { data: IProduct[] } = await fch.get('/products');
    setProducts(data);
  };

  const openInfo = async (id: string) => {
    setProductInfo({ open: true, id });
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case ProductStatus.SERIALIZED:
        return <Badge color="green">{status}</Badge>;
      case ProductStatus.APPROVED:
        return <Badge color="purple">{status}</Badge>;
      default:
        return <Badge color="blue">{status}</Badge>;
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
            <Table.TextHeaderCell>Size (Unit)</Table.TextHeaderCell>
            <Table.TextHeaderCell>Status</Table.TextHeaderCell>
            <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {products.map(({ id, batch, name, size, unit, status }, index) => (
              <Table.Row key={id}>
                <Table.TextCell>{index + 1}</Table.TextCell>
                <Table.TextCell>{batch}</Table.TextCell>
                <Table.TextCell>{name}</Table.TextCell>
                <Table.TextCell>{`${size} (${unit})`}</Table.TextCell>
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
                              open: true,
                              approve: true,
                              id: id!,
                              message: `Confirm approve "${batch} : ${name}"?`,
                              status: ProductStatus.APPROVED,
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
                              open: true,
                              approve: false,
                              id: id!,
                              message: `Confirm delete "${batch} : ${name}"?`,
                              status: '',
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
        open={dialogOption.open}
        approve={dialogOption.approve}
        message={dialogOption.message}
        path={`/products/${dialogOption.id}`}
        update={getAllProducts}
        reset={() => {
          setDialogOption({
            open: false,
            approve: false,
            id: '',
            message: '',
            status: '',
          });
        }}
        status={dialogOption.status}
      />
      <Dialog
        isShown={productInfo.open}
        hasClose={false}
        hasCancel={false}
        title="Product Info"
        confirmLabel="Close"
        onCloseComplete={() => setProductInfo({ open: false, id: '' })}
      >
        <ProductInfo id={productInfo.id} />
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
    const snapshot = await db.collection('/products').get();
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
