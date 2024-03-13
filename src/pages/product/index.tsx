import { ConfirmDialog, PageTitle, ViewInfo } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { UserContext } from '@/contexts/UserContext';
import { db } from '@/firebase/config';
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
import { collection, getDocs } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useContext, useState } from 'react';

export default function ProductPage({ data }: { data: IProduct[] }) {
  const { loading, startLoading, stopLoading } = useContext(LoadingContext);
  const { profile } = useContext(UserContext);
  const [products, setProducts] = useState(data);
  const [dialogOption, setDialogOption] = useState({
    open: false,
    approve: false,
    id: '',
    message: '',
    status: '',
  });
  const [viewInfo, setViewInfo] = useState({
    open: false,
    info: {},
  });

  const getAllProducts = async () => {
    const fch = customFetch();
    const { data }: { data: IProduct[] } = await fch.get('/products');
    setProducts(data);
  };

  const openDialog = (
    approve: boolean,
    id: string,
    message: string,
    status?: string
  ) => {
    startLoading();
    setDialogOption({
      open: true,
      approve,
      id,
      message,
      status: status || '',
    });
    stopLoading();
  };

  const openInfo = async (path: string) => {
    startLoading();
    const fch = customFetch();
    const { data }: { data: IProduct } = await fch.get(path);
    setViewInfo({ open: true, info: data });
    stopLoading();
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
                    <Link
                      href={
                        status === ProductStatus.CREATED
                          ? `/product/info/${id}`
                          : ''
                      }
                    >
                      <IconButton
                        type="button"
                        name="edit"
                        title="edit"
                        icon={EditIcon}
                        disabled={status !== ProductStatus.CREATED}
                      />
                    </Link>
                    <IconButton
                      type="button"
                      name="info"
                      title="info"
                      icon={LabelIcon}
                      onClick={() => openInfo(`/products/${id}`)}
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
                            openDialog(
                              true,
                              id as string,
                              `Confirm approve "${batch} : ${name}"?`,
                              ProductStatus.APPROVED
                            );
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
                            openDialog(
                              false,
                              id as string,
                              `Confirm delete "${batch} : ${name}"?`
                            );
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
        loading={loading}
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
        isShown={viewInfo.open}
        hasClose={false}
        hasCancel={false}
        title="Product Info"
        confirmLabel="Close"
        onCloseComplete={() => setViewInfo({ open: false, info: {} })}
      >
        <ViewInfo info={viewInfo.info} />
      </Dialog>
    </BaseLayout>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const token = req.cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  const snapshot = await getDocs(collection(db, 'products'));
  const data: IProduct[] = [];
  snapshot.forEach((doc) => {
    data.push({ id: doc.id, ...(doc.data() as IProduct) });
  });
  return {
    props: {
      data,
    },
  };
}
