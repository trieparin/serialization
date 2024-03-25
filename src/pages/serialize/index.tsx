import { PageTitle } from '@/components';
import { admin, db } from '@/firebase/admin';
import { BaseLayout } from '@/layouts';
import { ISerialize, SerializeStatus } from '@/models/serialize.model';
import { Role } from '@/models/user.model';
import {
  Badge,
  IconButton,
  LabelIcon,
  Pane,
  Table,
  majorScale,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';

export default function SerializePage({ data }: { data: ISerialize[] }) {
  const renderStatus = (status: string) => {
    switch (status) {
      case SerializeStatus.LABELED:
        return <Badge color="orange">{status}</Badge>;
      case SerializeStatus.VERIFIED:
        return <Badge color="purple">{status}</Badge>;
      default:
        return <Badge color="teal">{status}</Badge>;
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="All Serials" />
      <Pane overflowX="auto">
        <Table minWidth="max-content">
          <Table.Head minWidth={1214} paddingRight={0}>
            <Table.TextHeaderCell>No.</Table.TextHeaderCell>
            <Table.TextHeaderCell>Label</Table.TextHeaderCell>
            <Table.TextHeaderCell>Status</Table.TextHeaderCell>
            <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {data.map(({ id, label, status }, index) => (
              <Table.Row key={id}>
                <Table.TextCell>{index + 1}</Table.TextCell>
                <Table.TextCell>{label}</Table.TextCell>
                <Table.TextCell>{renderStatus(status)}</Table.TextCell>
                <Table.Cell>
                  <Pane display="flex" columnGap={majorScale(1)}>
                    <IconButton
                      type="button"
                      name="info"
                      title="info"
                      icon={LabelIcon}
                    />
                  </Pane>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Pane>
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

    const data: ISerialize[] = [];
    const snapshot = await db.collection('serials').get();
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...(doc.data() as ISerialize) });
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
