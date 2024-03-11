import { ConfirmDialog, PageTitle } from '@/components';
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
  });

  const getAllProducts = async () => {
    const fch = customFetch();
    const { data }: any = await fch.get('/products');
    setProducts(data);
  };

  const openDialog = (approve: boolean, id: string, message: string) => {
    startLoading();
    setDialogOption({
      open: true,
      approve,
      id,
      message,
    });
    stopLoading();
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case ProductStatus.SERIALIZED:
        return <Badge color="green">{status}</Badge>;
        break;
      case ProductStatus.APPROVED:
        return <Badge color="purple">{status}</Badge>;
        break;
      default:
        return <Badge color="blue">{status}</Badge>;
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="All Products" link="/product/create" hasAddButton />
      <Table>
        <Table.Head paddingRight={0}>
          <Table.TextHeaderCell>No.</Table.TextHeaderCell>
          <Table.TextHeaderCell>Name</Table.TextHeaderCell>
          <Table.TextHeaderCell>Batch</Table.TextHeaderCell>
          <Table.TextHeaderCell>Size (Unit)</Table.TextHeaderCell>
          <Table.TextHeaderCell>Status</Table.TextHeaderCell>
          <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {products.map(({ id, batch, name, size, unit, status }, index) => (
            <Table.Row key={id}>
              <Table.TextCell>{index + 1}</Table.TextCell>
              <Table.TextCell>{name}</Table.TextCell>
              <Table.TextCell>{batch}</Table.TextCell>
              <Table.TextCell>{`${size} (${unit})`}</Table.TextCell>
              <Table.TextCell>{renderStatus(status)}</Table.TextCell>
              <Table.TextCell>
                <Pane display="flex" columnGap={majorScale(1)}>
                  <Link href={`/product/info/${id}`}>
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
                            `Confirm approve "${batch} : ${name}"?`
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
              </Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <ConfirmDialog
        open={dialogOption.open}
        approve={dialogOption.approve}
        loading={loading}
        message={dialogOption.message}
        path={`/products/${dialogOption.id}`}
        update={getAllProducts}
        reset={() => {
          setDialogOption({ open: false, approve: false, id: '', message: '' });
        }}
      />
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
