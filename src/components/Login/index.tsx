import { Logo } from '@/components';
import styles from '@/styles/components/Login.module.css';
import { Button, Card, TextInputField, majorScale } from 'evergreen-ui';
import { FormEvent } from 'react';

export const Login = () => {
  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    console.log('login');
  };

  return (
    <Card
      background="tint1"
      elevation={2}
      padding={majorScale(5)}
      minWidth="40%"
    >
      <form method="post" onSubmit={handleLogin} className={styles.loginForm}>
        <div className={styles.loginLogo}>
          <Logo />
        </div>
        <TextInputField label="Username" type="text" width="70%" />
        <TextInputField label="Password" type="password" width="70%" />
        <Button appearance="primary" size="large">
          Login
        </Button>
      </form>
    </Card>
  );
};
