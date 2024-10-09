import { PageTitle } from '@/components';
import { admin } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { IProduct, PRODUCT_STATUS } from '@/models/product.model';
import { ISerialize, SERIALIZE_STATUS } from '@/models/serialize.model';
import { ROLE } from '@/models/user.model';
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
import { Card, Pane, Select, Text, majorScale } from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { ChangeEvent, useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

interface ISummary {
  products: IProduct[];
  serials: ISerialize[];
}

export default function SummaryPage() {
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
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 8,
    },
  };
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [serialStatus, setSerialStatus] = useState({});
  const [productStatus, setProductStatus] = useState({});
  const [productAmount, setProductAmount] = useState({});
  const [distribute, setDistribute] = useState({});

  const convertToCountObj = (items: string[], counts: string[]) => {
    const convert = items.reduce(
      (total, value) => ({ ...total, [value]: 0 }),
      {} as Record<string, number>
    );
    counts.forEach((count) => (convert[count] += 1));
    return convert;
  };

  useEffect(() => {
    const getSummary = async () => {
      const fch = customFetch();
      const { products, serials }: ISummary = await fch.get(
        `/summary?year=${year}`
      );
      const srlStatus: Record<string, number> = convertToCountObj(
        Object.values(SERIALIZE_STATUS),
        [...serials.map((serial) => serial.status)]
      );
      const prdStatus: Record<string, number> = convertToCountObj(
        Object.values(PRODUCT_STATUS),
        [...products.map((product) => product.status)]
      );
      const prdCount = convertToCountObj(
        [...new Set(products.map((product) => product.name))],
        [...products.map((product) => product.name)]
      );
      const distCount = convertToCountObj(
        Array.from({ length: 12 }, (_, index) => index.toString()),
        [
          ...serials
            .filter((serial) => serial.status === SERIALIZE_STATUS.DISTRIBUTED)
            .map((serial) => {
              return new Date(serial.updated!).getMonth().toString();
            }),
        ]
      );
      setSerialStatus(srlStatus);
      setProductStatus(prdStatus);
      setProductAmount(prdCount);
      setDistribute(distCount);
    };
    getSummary();
  }, [year]);

  return (
    <BaseLayout>
      <PageTitle title="Summary" />
      <Pane
        textAlign="right"
        marginBottom={majorScale(2)}
      >
        <Text>Select Year :</Text>
        <Select
          marginLeft={majorScale(1)}
          value={year}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            setYear(parseInt(event.currentTarget.value));
          }}
        >
          {[...Array(5)].map((_, index) => (
            <option
              key={index}
              value={currentYear - index}
            >
              {currentYear - index}
            </option>
          ))}
        </Select>
      </Pane>
      <Pane
        marginBottom={majorScale(2)}
        className="summary-layout"
      >
        <Card
          elevation={1}
          paddingX={majorScale(2)}
          className="summary-pie"
        >
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
              labels: Object.keys(serialStatus),
              datasets: [
                {
                  data: Object.values(serialStatus),
                  backgroundColor: ['#F8E3DA', '#E7E4F9', '#D3F5F7'],
                  borderColor: ['#996A13', '#6E62B6', '#0F5156'],
                  borderWidth: 1,
                },
              ],
            }}
          />
        </Card>
        <Card
          elevation={1}
          paddingX={majorScale(2)}
          className="summary-pie"
        >
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
              labels: Object.keys(productStatus),
              datasets: [
                {
                  data: Object.values(productStatus),
                  backgroundColor: ['#FFEFD2', '#D6E0FF', '#DCF2EA'],
                  borderColor: ['#66460D', '#2952CC', '#317159'],
                  borderWidth: 1,
                },
              ],
            }}
          />
        </Card>
        <Card
          elevation={1}
          paddingX={majorScale(2)}
          className="summary-bar"
        >
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
              labels: Object.keys(productAmount),
              datasets: [
                {
                  data: Object.values(productAmount),
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
        <Card
          elevation={1}
          paddingX={majorScale(2)}
          className="summary-line"
        >
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
              labels: [
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
              ],
              datasets: [
                {
                  data: Object.values(distribute),
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
    if (role !== ROLE.SUPERVISOR) {
      return { redirect: { destination: '/no-permission' } };
    }

    return { props: {} };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
