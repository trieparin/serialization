import { LoadingProvider } from '@/contexts/LoadingContext';
import { UserProvider } from '@/contexts/UserContext';
import '@/styles/globals.css';
import { defaultTheme, ThemeProvider } from 'evergreen-ui';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Serialization</title>
        <meta
          name="description"
          content="Simple Batch Serialization"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>
      <LoadingProvider>
        <UserProvider>
          <ThemeProvider value={defaultTheme}>
            <Component {...pageProps} />
          </ThemeProvider>
        </UserProvider>
      </LoadingProvider>
    </>
  );
}
