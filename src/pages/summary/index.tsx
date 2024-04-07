import { PageTitle } from '@/components';
import { admin } from '@/firebase/admin';
import { BaseLayout } from '@/layouts';
import { Role } from '@/models/user.model';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Card, Pane, majorScale } from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Title,
  Tooltip
);

export default function SummaryPage() {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 8,
    },
  };

  return (
    <BaseLayout>
      <PageTitle title="Summary" />
      <Pane marginBottom={majorScale(2)} className="summary-layout">
        <Card elevation={1} paddingX={majorScale(2)} className="summary-pie">
          <Doughnut
            options={{
              ...baseOptions,
              plugins: {
                title: {
                  display: true,
                  text: 'Serialize Status',
                },
                legend: {
                  position: 'right',
                },
              },
            }}
            data={{
              labels: ['Labeled', 'Verified', 'Distributed'],
              datasets: [
                {
                  data: [224, 94, 67],
                  backgroundColor: ['#F8E3DA', '#E7E4F9', '#D3F5F7'],
                  borderColor: ['#996A13', '#6E62B6', '#0F5156'],
                  borderWidth: 1,
                },
              ],
            }}
          />
        </Card>
        <Card elevation={1} paddingX={majorScale(2)} className="summary-pie">
          <Doughnut
            options={{
              ...baseOptions,
              plugins: {
                title: {
                  display: true,
                  text: 'Product Status',
                },
                legend: {
                  position: 'right',
                },
              },
            }}
            data={{
              labels: ['Created', 'Approved', 'Serialized'],
              datasets: [
                {
                  data: [146, 79, 33],
                  backgroundColor: ['#FFEFD2', '#D6E0FF', '#DCF2EA'],
                  borderColor: ['#66460D', '#2952CC', '#317159'],
                  borderWidth: 1,
                },
              ],
            }}
          />
        </Card>
        <Card elevation={1} paddingX={majorScale(2)} className="summary-bar">
          <Bar
            options={{
              ...baseOptions,
              plugins: {
                title: {
                  display: true,
                  text: 'Products / Year',
                },
                legend: {
                  display: false,
                },
              },
            }}
            data={{
              labels: [
                'Product 1',
                'Product 2',
                'Product 3',
                'Product 4',
                'Product 5',
                'Product 6',
                'Product 7',
                'Product 8',
                'Product 9',
                'Product 10',
              ],
              datasets: [
                {
                  data: [65, 59, 80, 81, 56, 55, 40, 59, 34, 34],
                  backgroundColor: [
                    '#F9DADA',
                    '#F8E3DA',
                    '#FFEFD2',
                    '#D6E0FF',
                    '#DCF2EA',
                  ],
                  borderColor: [
                    '#7D2828',
                    '#996A13',
                    '#66460D',
                    '#2952CC',
                    '#317159',
                  ],
                  borderWidth: 1,
                },
              ],
            }}
          />
        </Card>
        <Card elevation={1} paddingX={majorScale(2)} className="summary-line">
          <Line
            options={{
              ...baseOptions,
              plugins: {
                title: {
                  display: true,
                  text: 'Distributes / Month',
                },
                legend: {
                  display: false,
                },
              },
            }}
            data={{
              labels: months,
              datasets: [
                {
                  data: [65, 59, 80, 81, 56, 55, 40, 34, 98, 56, 75, 75],
                  backgroundColor: '#E7E4F9',
                  borderColor: '#6E62B6',
                  borderWidth: 1,
                },
              ],
            }}
          />
        </Card>
      </Pane>
    </BaseLayout>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (!role) return { redirect: { destination: '/' } };
    if (role !== Role.SUPERVISOR) {
      return { redirect: { destination: '/no-permission' } };
    }

    return {
      props: {},
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
