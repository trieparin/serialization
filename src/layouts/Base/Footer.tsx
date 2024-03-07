import { Pane, Paragraph, minorScale } from 'evergreen-ui';

export const Footer = () => {
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
