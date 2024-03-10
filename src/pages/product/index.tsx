import { PageTitle } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { BaseLayout } from '@/layouts';
import { Role } from '@/models/user.model';
import {
  BarcodeIcon,
  EditIcon,
  EndorsedIcon,
  IconButton,
  Pane,
  Table,
  TrashIcon,
  majorScale,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useContext } from 'react';

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
  const { profile } = useContext(UserContext);

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
                    <IconButton type="button" name="edit" icon={EditIcon} />
                  </Link>
                  {profile.role === Role.OPERATOR ? (
                    <IconButton
                      type="button"
                      name="barcode"
                      intent="success"
                      icon={BarcodeIcon}
                    />
                  ) : (
                    <>
                      <IconButton
                        type="button"
                        name="verify"
                        intent="success"
                        icon={EndorsedIcon}
                      />

                      <IconButton
                        type="button"
                        name="delete"
                        intent="danger"
                        icon={TrashIcon}
                      />
                    </>
                  )}
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
