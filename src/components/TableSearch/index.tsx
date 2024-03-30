import customFetch from '@/helpers/fetch.helper';
import { Table } from 'evergreen-ui';
import { useEffect, useState } from 'react';

interface TableSearchProps {
  placeholder: string;
  path: string;
  find: string;
  update: (search: []) => void;
  reset: () => void;
}

export const TableSearch = ({
  placeholder,
  path,
  find,
  update,
  reset,
}: TableSearchProps) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (query) {
      const timeout = setTimeout(async () => {
        const fch = customFetch();
        const { data }: { data: [] } = await fch.get(
          `${path}?${find}=${query}`
        );
        update(data);
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, path, find]);

  return (
    <Table.SearchHeaderCell
      placeholder={placeholder}
      onChange={(value: string) => setQuery(value)}
    />
  );
};
