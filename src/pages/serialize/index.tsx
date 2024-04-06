import { PageTitle, Paginate, TableSearch, TableSelect } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { admin, db } from '@/firebase/admin';
import { BaseLayout } from '@/layouts';
import { PageSize } from '@/models/form.model';
import { ISerialize, SerializeStatus } from '@/models/serialize.model';
import { Role } from '@/models/user.model';
import {
  Badge,
  BoxIcon,
  EndorsedIcon,
  IconButton,
  LabelIcon,
  Pane,
  Table,
  majorScale,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useContext, useState } from 'react';

interface SerializePageProps {
  data: ISerialize[];
  total: number;
}

export default function SerializePage({ data, total }: SerializePageProps) {
  const profile = useContext(UserContext);
  const [serials, setSerials] = useState<ISerialize[]>(data);

  // const getAllSerials = async () => {
  //   const fch = customFetch();
  //   const { data }: { data: ISerialize[] } = await fch.get('/serials');
  //   setSerials(data);
  // };

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
          <Table.Head
            minWidth={900}
            paddingRight={0}
            paddingY={majorScale(1)}
            alignItems="flex-start"
          >
            <Table.TextHeaderCell>
              Label
              <TableSearch placeholder="Label" find="label" />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>
              Status
              <TableSelect options={SerializeStatus} />
            </Table.TextHeaderCell>
            <Table.TextHeaderCell flexBasis={200} flexShrink={0} flexGrow={0}>
              Actions
            </Table.TextHeaderCell>
          </Table.Head>
          <Table.Body>
            {serials.map(({ id, label, status }) => (
              <Table.Row key={id}>
                <Table.TextCell>{label}</Table.TextCell>
                <Table.TextCell>{renderStatus(status)}</Table.TextCell>
                <Table.Cell flexBasis={200} flexShrink={0} flexGrow={0}>
                  <Pane display="flex" columnGap={majorScale(1)}>
                    <IconButton
                      type="button"
                      name="info"
                      title="info"
                      icon={LabelIcon}
                    />
                    {profile.role === Role.SUPERVISOR && (
                      <IconButton
                        type="button"
                        name="verify"
                        title="verify"
                        intent="success"
                        icon={EndorsedIcon}
                        disabled={status !== SerializeStatus.LABELED}
                      />
                    )}
                    <IconButton
                      type="button"
                      name="distribute"
                      title="distribute"
                      intent="success"
                      icon={BoxIcon}
                      disabled={status !== SerializeStatus.VERIFIED}
                    />
                  </Pane>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Paginate
          update={(value: ISerialize[]) => setSerials(value)}
          path="/serials"
          total={total}
        />
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
    const snapshot = db.collection('serials');
    const select = await snapshot.get();
    const total = Math.ceil((await snapshot.get()).size / PageSize.PER_PAGE);
    select.forEach((doc) => {
      data.push({ id: doc.id, ...(doc.data() as ISerialize) });
    });

    return {
      props: {
        data,
        total,
      },
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
