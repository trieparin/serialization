import { PageTitle } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { UserContext } from '@/contexts/UserContext';
import { db } from '@/firebase/config';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { IProduct, ProductStatus } from '@/models/product.model';
import { Role } from '@/models/user.model';
import {
  BarcodeIcon,
  Dialog,
  EditIcon,
  EndorsedIcon,
  IconButton,
  Pane,
  Table,
  TrashIcon,
  majorScale,
  toaster,
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
    message: '',
    id: '',
  });

  const getAllProducts = async () => {
    const fch = customFetch();
    const { data }: any = await fch.get('/users');
    setProducts(data);
  };

  const handleDelete = async (close: () => void) => {
    startLoading();
    try {
      const fch = customFetch();
      const { message }: any = await fch.del(`/products/${dialogOption.id}`);
      toaster.success(message);
      getAllProducts();
    } catch (error) {
      toaster.danger('An error occurred');
    }
    stopLoading();
    close();
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
              <Table.TextCell>{status}</Table.TextCell>
              <Table.TextCell>
                <Pane display="flex" columnGap={majorScale(1)}>
                  <Link href={`/product/info/${id}`}>
                    <IconButton
                      type="button"
                      name="edit"
                      title="edit"
                      icon={EditIcon}
                    />
                  </Link>
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
                      />
                      <IconButton
                        type="button"
                        name="delete"
                        title="delete"
                        intent="danger"
                        icon={TrashIcon}
                        disabled={status === ProductStatus.SERIALIZED}
                        onClick={() =>
                          setDialogOption({
                            open: true,
                            message: `Confirm delete "${batch} : ${name}"?`,
                            id: id as string,
                          })
                        }
                      />
                    </>
                  )}
                </Pane>
              </Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Dialog
        isShown={dialogOption.open}
        hasClose={false}
        title="Confirmation"
        intent="danger"
        confirmLabel="Delete"
        isConfirmLoading={loading}
        onConfirm={(close) => handleDelete(close)}
        onCloseComplete={() =>
          setDialogOption({
            open: false,
            message: '',
            id: '',
          })
        }
      >
        {dialogOption.message}
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
