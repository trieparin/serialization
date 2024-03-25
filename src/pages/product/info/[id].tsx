import { PageTitle, ProductForm } from '@/components';
import { admin, db } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { formChangeValue } from '@/helpers/form.helper';
import { BaseLayout } from '@/layouts';
import { IFormMessage } from '@/models/form.model';
import { IProduct } from '@/models/product.model';
import { Role } from '@/models/user.model';
import { toaster } from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

interface ProductInfoProps {
  params: ParsedUrlQuery;
  data: IProduct;
}

export default function ProductInfo({ params, data }: ProductInfoProps) {
  const router = useRouter();
  const formSubmit = async (values: object, changes?: object) => {
    try {
      const data: object = formChangeValue(changes!, values);
      const fch = customFetch();
      const { message }: IFormMessage = await fch.patch(
        `/products/${params.id}`,
        data
      );
      toaster.success(message);
      router.push('/product');
    } catch (e) {
      toaster.danger('An error occurred');
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Edit Product Info" />
      <ProductForm initForm={data} formSubmit={formSubmit} />
    </BaseLayout>
  );
}

export async function getServerSideProps({
  req,
  params,
}: GetServerSidePropsContext) {
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (!role) return { redirect: { destination: '/' } };
    if (role === Role.ADMIN) {
      return { redirect: { destination: '/no-permission' } };
    }

    const doc = await db
      .collection('/products')
      .doc(params?.id as string)
      .get();
    const data = doc.exists && doc.data();

    return {
      props: {
        params,
        data,
      },
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
