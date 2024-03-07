import { UserContext } from '@/contexts/UserContext';
import { Pane, Paragraph, minorScale } from 'evergreen-ui';
import { useContext, useEffect } from 'react';

export const Footer = () => {
  const { profile, checkLogin } = useContext(UserContext);

  useEffect(() => {
    if (!profile.uid) checkLogin();
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
