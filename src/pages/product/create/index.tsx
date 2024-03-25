import { PageTitle, ProductForm } from '@/components';
import { admin } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { IFormMessage } from '@/models/form.model';
import { ProductStatus, ProductType } from '@/models/product.model';
import { Role } from '@/models/user.model';
import { toaster } from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';

export default function ProductCreate() {
  const router = useRouter();
  const formSubmit = async (values: object) => {
    try {
      const fch = customFetch();
      const { message }: IFormMessage = await fch.post(`/products`, values);
      toaster.success(message);
      router.push('/product');
    } catch (e) {
      toaster.danger('An error occurred');
    }
  };

  const initForm = {
    register: '',
    name: '',
    type: ProductType.NON_DRUG,
    batch: '',
    size: 0,
    pack: '',
    dosage: '',
    amount: 0,
    unit: '',
    manufacturer: '',
    mfd: '',
    exp: '',
    ingredients: [{ ingredient: '', quantity: 0, uom: '' }],
    status: ProductStatus.CREATED,
  };

  return (
    <BaseLayout>
      <PageTitle title="Create New Product" />
      <ProductForm initForm={initForm} formSubmit={formSubmit} />
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
    return { props: {} };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
