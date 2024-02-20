import Login from '@/components/Login';
import { Pane } from 'evergreen-ui';

export default function Home() {
  return (
    <main>
      <Pane
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Login />
      </Pane>
    </main>
  );
}
