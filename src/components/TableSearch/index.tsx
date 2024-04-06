import { Table, minorScale } from 'evergreen-ui';

interface TableSearchProps {
  placeholder: string;
  find: string;
}

export const TableSearch = ({ placeholder, find }: TableSearchProps) => {
  return (
    <Table.SearchHeaderCell
      placeholder={placeholder}
      onChange={(value: string) => `${find}=${value}`}
      padding={0}
      marginY={minorScale(1)}
    />
  );
};
