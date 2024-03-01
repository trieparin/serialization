import {
  ActiveIngredient,
  BatchInformation,
  PageTitle,
  SaveCancel,
} from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { BaseLayout } from '@/layouts';
import { Pane } from 'evergreen-ui';
import { FormEvent, useContext, useEffect, useState } from 'react';

export default function ProductCreate() {
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);
  const [isValidate, setIsValidate] = useState(false);

  useEffect(() => {
    stopLoading();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    startLoading();
  };

  return (
    <BaseLayout>
      <PageTitle title="Create New Product" />
      <Pane is="form" onSubmit={handleSubmit}>
        <Pane is="fieldset" border="none">
          <BatchInformation />
          <ActiveIngredient />
        </Pane>
        <SaveCancel loading={isLoading} disabled={!isValidate} />
      </Pane>
    </BaseLayout>
  );
}
