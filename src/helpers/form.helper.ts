export const regExPassword = () => {
  return /^(?!.*\s)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
};

export const checkPassword = (password: string) => {
  const regEx = regExPassword();
  return regEx.test(password);
};

export const formHasChange = (field: object) => {
  const changes = Object.values(field);
  return changes.some((change) => change);
};

export const formChangeValue = (field: object, value: object) => {
  const changes = { ...field };
  const items = Object.keys(changes);
  items.forEach(
    (item) => (changes[item as keyof object] = value[item as keyof object])
  );
  return changes;
};
