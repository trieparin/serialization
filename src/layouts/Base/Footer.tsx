import { UserContext } from '@/contexts/UserContext';
import { ValidateCookie } from '@/helpers/validate.helper';
import { Pane, Paragraph, minorScale } from 'evergreen-ui';
import { useContext, useEffect } from 'react';

export const Footer = () => {
  const { profile, checkLogin } = useContext(UserContext);

  useEffect(() => {
    const token = ValidateCookie('token');
    if (token && !profile.uid) checkLogin(true);
  }, []);

  return (
    <Pane
      is="footer"
      textAlign="center"
      marginTop="auto"
      paddingY={minorScale(3)}
      className="container"
    >
      <Paragraph>DPU WE670 | Parin Trieakanuparb (65130273)</Paragraph>
    </Pane>
  );
};
