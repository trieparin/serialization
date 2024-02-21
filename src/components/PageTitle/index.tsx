import { IPageTitle } from '@/models/PageTitle.model';
import { Button, Heading, Pane, PlusIcon, majorScale } from 'evergreen-ui';
import Link from 'next/link';

export const PageTitle = ({ title, link, hasAddButton }: IPageTitle) => {
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
