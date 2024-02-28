import {
  ActiveIngredient,
  BatchInformation,
  PageTitle,
  SaveCancel,
} from '@/components';
import { BaseLayout } from '@/layouts';
import { Pane } from 'evergreen-ui';
import { FormEvent, useState } from 'react';

export default function ProductCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  };

  return (
    <BaseLayout>
      <PageTitle title="Create New Product" />
      <Pane is="form" onSubmit={handleSubmit}>
        <Pane is="fieldset" border="none">
          <BatchInformation />
          <ActiveIngredient />
        </Pane>
        <SaveCancel loading={isLoading} />
      </Pane>
    </BaseLayout>
  );
}
