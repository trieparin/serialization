import { PageTitle } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { BaseLayout } from '@/layouts';
import { EditIcon, Pane, Table, TrashIcon, minorScale } from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useContext, useEffect } from 'react';

const mockProducts = [
  {
    id: 1,
    name: 'Paracetamol',
    batch: 'TST-001',
    size: '100 (Boxes)',
    status: 'Approved',
  },
  {
    id: 2,
    name: 'Paracetamol',
    batch: 'TST-002',
    size: '100 (Boxes)',
    status: 'Approved',
  },
];

export default function ProductPage() {
  const { stopLoading } = useContext(LoadingContext);

  useEffect(() => {
    stopLoading();
  }, [stopLoading]);

  return (
    <BaseLayout>
      <PageTitle title="All Products" link="/product/create" hasAddButton />
      <Table>
        <Table.Head paddingRight="0">
          <Table.TextHeaderCell>No.</Table.TextHeaderCell>
          <Table.TextHeaderCell>Name</Table.TextHeaderCell>
          <Table.TextHeaderCell>Batch</Table.TextHeaderCell>
          <Table.TextHeaderCell>Size</Table.TextHeaderCell>
          <Table.TextHeaderCell>Status</Table.TextHeaderCell>
          <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {mockProducts.map(({ id, batch, name, size, status }, index) => (
            <Table.Row key={id}>
              <Table.TextCell>{index + 1}</Table.TextCell>
              <Table.TextCell>{name}</Table.TextCell>
              <Table.TextCell>{batch}</Table.TextCell>
              <Table.TextCell>{size}</Table.TextCell>
              <Table.TextCell>{status}</Table.TextCell>
              <Table.TextCell>
                <Pane display="flex" columnGap={minorScale(3)}>
                  <Link href={`/product/info/${id}`}>
                    <EditIcon color="dark" cursor="pointer" />
                  </Link>
                  <TrashIcon color="red" cursor="pointer" />
                </Pane>
              </Table.TextCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </BaseLayout>
  );
}

export function getServerSideProps({ req }: GetServerSidePropsContext) {
  const token = req.cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  return {
    props: {},
  };
}
