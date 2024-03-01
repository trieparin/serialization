import { LoadingProvider } from '@/contexts/LoadingContext';
import { UserInfoProvider } from '@/contexts/UserInfoContext';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>WE670 - Serialization</title>
        <meta name="description" content="Simple Batch Serialization" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LoadingProvider>
        <UserInfoProvider>
          <Component {...pageProps} />
        </UserInfoProvider>
      </LoadingProvider>
    </>
  );
}
