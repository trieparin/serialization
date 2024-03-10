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
      <Paragraph>Student ID: 65130273 | Parin Trieakanuparb </Paragraph>
    </Pane>
  );
};
