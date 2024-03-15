import { Card, Heading, Paragraph, majorScale } from 'evergreen-ui';

interface ErrorPageProps {
  title: string;
  message: string;
}

export const ErrorPage = ({ title, message }: ErrorPageProps) => {
  return (
    <Card
      elevation={2}
      textAlign="center"
      background="tint1"
      position="relative"
      width="40%"
      minWidth="max-content"
      padding={majorScale(5)}
    >
      <Heading is="h1" size={900} marginBottom={majorScale(3)}>
        {title}
      </Heading>
      <Paragraph>{message}</Paragraph>
    </Card>
  );
};
