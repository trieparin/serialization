import { Button, Heading, Pane, PlusIcon, majorScale } from 'evergreen-ui';
import Link from 'next/link';

interface PageTitleProps {
  title: string;
  link?: string;
  hasAddButton?: boolean;
}

export const PageTitle = ({ title, link, hasAddButton }: PageTitleProps) => {
  return (
    <Pane
      is="section"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      paddingY={majorScale(3)}
      marginBottom={majorScale(1)}
    >
      <Heading is="h1" size={900}>
        {title}
      </Heading>
      {hasAddButton && (
        <Link href={link || ''}>
          <Button appearance="primary" size="large" iconAfter={<PlusIcon />}>
            Add New
          </Button>
        </Link>
      )}
    </Pane>
  );
};
