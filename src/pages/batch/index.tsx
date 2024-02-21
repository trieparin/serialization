import { PageTitle } from '@/components';
import { BaseLayout } from '@/layouts';
import { EditIcon, Pane, Table, TrashIcon, minorScale } from 'evergreen-ui';
import Link from 'next/link';

const mockBatches = [
  {
    id: 1,
    batchId: 'TST-001',
    name: 'Paracetamol',
    size: '100 (Boxes)',
    status: 'Approved',
  },
  {
    id: 2,
    batchId: 'TST-002',
    name: 'Paracetamol',
    size: '100 (Boxes)',
    status: 'Approved',
  },
];

export default function BatchPage() {
  return (
    <BaseLayout>
      <PageTitle title="All Batches" link="/batch/new" hasAddButton />
      <Table>
        <Table.Head paddingRight="0">
          <Table.TextHeaderCell>No.</Table.TextHeaderCell>
          <Table.TextHeaderCell>ID</Table.TextHeaderCell>
          <Table.TextHeaderCell>Name</Table.TextHeaderCell>
          <Table.TextHeaderCell>Size</Table.TextHeaderCell>
          <Table.TextHeaderCell>Status</Table.TextHeaderCell>
          <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {mockBatches.map(({ id, batchId, name, size, status }, index) => (
            <Table.Row key={id}>
              <Table.TextCell>{index + 1}</Table.TextCell>
              <Table.TextCell>{batchId}</Table.TextCell>
              <Table.TextCell>{name}</Table.TextCell>
              <Table.TextCell>{size}</Table.TextCell>
              <Table.TextCell>{status}</Table.TextCell>
              <Table.TextCell>
                <Pane display="flex" columnGap={minorScale(3)}>
                  <Link href="/batch/info">
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
