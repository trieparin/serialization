import { Table, minorScale } from 'evergreen-ui';

interface TableSearchProps {
  placeholder: string;
  dispatch: (value: string) => void;
  hidden?: boolean;
}

export const TableSearch = ({
  placeholder,
  dispatch,
  hidden,
}: TableSearchProps) => {
  return (
    <Table.SearchHeaderCell
      placeholder={placeholder}
      onChange={(value: string) => dispatch(value)}
      padding={0}
      marginY={minorScale(1)}
      display={hidden ? 'none' : 'flex'}
    />
  );
};
