import customFetch from '@/helpers/fetch.helper';
import { PageSize } from '@/models/form.model';
import { Pagination, majorScale } from 'evergreen-ui';
import { useState } from 'react';

interface PaginateProps {
  update: (value: []) => void;
  path: string;
  total: number;
}

export const Paginate = ({ update, path, total }: PaginateProps) => {
  const [page, setPage] = useState(1);

  const updateData = async (offset: number) => {
    const fch = customFetch();
    if (offset > 1) {
      const { data }: { data: [] } = await fch.get(
        `${path}?offset=${(offset - 1) * PageSize.PER_PAGE}`
      );
      update(data);
    } else {
      const { data }: { data: [] } = await fch.get(path);
      update(data);
    }
  };

  return (
    <Pagination
      marginY={majorScale(2)}
      page={page}
      totalPages={total}
      onNextPage={() => {
        updateData(page + 1);
        setPage(page + 1);
      }}
      onPreviousPage={() => {
        updateData(page - 1);
        setPage(page - 1);
      }}
      onPageChange={(num) => {
        updateData(num);
        setPage(num);
      }}
      className="pagination"
    />
  );
};
