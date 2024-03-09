import { Pane, Paragraph, majorScale } from 'evergreen-ui';

export const Footer = () => {
  return (
    <Pane
      is="footer"
      textAlign="center"
      paddingY={majorScale(1)}
      marginTop="auto"
      className="container"
    >
      <Paragraph>DPU WE670 | Parin Trieakanuparb (65130273)</Paragraph>
    </Pane>
  );
};
