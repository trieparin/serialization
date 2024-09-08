import customFetch from '@/helpers/fetch.helper';
import { PAGE_SIZE } from '@/models/form.model';
import { Pagination, majorScale } from 'evergreen-ui';
import { useEffect, useState } from 'react';

interface PaginateProps {
  update: (value: []) => void;
  query: string;
  path: string;
  total: number;
  sort: boolean;
}

export const Paginate = ({
  update,
  query,
  path,
  total,
  sort,
}: PaginateProps) => {
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [sort]);

  const updateData = async (offset: number) => {
    const fch = customFetch();
    if (offset > 1) {
      if (query) {
        const { data }: { data: [] } = await fch.get(
          `${path}?${query}&offset=${(offset - 1) * PAGE_SIZE.PER_PAGE}`
        );
        update(data);
      } else {
        const { data }: { data: [] } = await fch.get(
          `${path}?sort=${sort ? 'created' : 'updated'}&offset=${
            (offset - 1) * PAGE_SIZE.PER_PAGE
          }`
        );
        update(data);
      }
    } else {
      if (query) {
        const { data }: { data: [] } = await fch.get(`${path}/filter?${query}`);
        update(data);
      } else {
        const { data }: { data: [] } = await fch.get(
          `${path}?sort=${sort ? 'created' : 'updated'}`
        );
        update(data);
      }
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
