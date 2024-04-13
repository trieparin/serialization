import { Select } from 'evergreen-ui';
import { ChangeEvent } from 'react';

interface TableSelectProps {
  options: object;
  dispatch: (value: string) => void;
}

export const TableSelect = ({ options, dispatch }: TableSelectProps) => {
  return (
    <>
      <br />
      <Select
        size="small"
        className="table-select"
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          dispatch(event.currentTarget.value);
        }}
      >
        <option value="">Any</option>
        {Object.values(options).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </>
  );
};
