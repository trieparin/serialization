import { Select } from 'evergreen-ui';

export const TableSelect = ({ options }: { options: object }) => {
  return (
    <>
      <br />
      <Select size="small" className="table-select">
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
