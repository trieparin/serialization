import { PageTitle } from '@/components';
import { BaseLayout } from '@/layouts';
import {
  EditIcon,
  IconButton,
  Pane,
  Table,
  TrashIcon,
  majorScale,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';

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
  return (
    <BaseLayout>
      <PageTitle title="All Products" link="/product/create" hasAddButton />
      <Table>
        <Table.Head paddingRight={0}>
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
                <Pane display="flex" columnGap={majorScale(1)}>
                  <Link href={`/product/info/`}>
                    <IconButton icon={EditIcon} />
                  </Link>
                  <IconButton intent="danger" icon={TrashIcon} />
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
