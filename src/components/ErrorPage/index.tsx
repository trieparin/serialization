import {
  Card,
  Heading,
  Paragraph,
  Link as UiLink,
  majorScale,
} from 'evergreen-ui';
import Link from 'next/link';

interface ErrorPageProps {
  title: string;
  message: string;
  path: string;
  back: string;
}

export const ErrorPage = ({ title, message, path, back }: ErrorPageProps) => {
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
      <Heading
        is="h1"
        size={900}
      >
        {title}
      </Heading>
      <Paragraph marginY={majorScale(3)}>{message}</Paragraph>
      <Link href={path}>
        <UiLink is="span">{back}</UiLink>
      </Link>
    </Card>
  );
};
