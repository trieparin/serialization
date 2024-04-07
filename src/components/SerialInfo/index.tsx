import {
  Heading,
  ListItem,
  Pane,
  Text,
  UnorderedList,
  majorScale,
} from 'evergreen-ui';

interface SerialInfoProps {
  label: string;
  serials: string[];
}

export const SerialInfo = ({ label, serials }: SerialInfoProps) => {
  return (
    <Pane display="flex" flexFlow="column" rowGap={majorScale(2)}>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Label:</Heading>
        <Text>{label}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Serials:</Heading>
        <UnorderedList
          display="grid"
          gridTemplateColumns="repeat(2, minmax(0, 1fr))"
        >
          {serials.map((serial) => (
            <ListItem key={serial}>{serial}</ListItem>
          ))}
        </UnorderedList>
      </Pane>
    </Pane>
  );
};
