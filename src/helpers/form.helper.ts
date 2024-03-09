export const regExPassword = () => {
  return /^(?!.*\s)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
};

export const checkPassword = (password: string) => {
  const regEx = regExPassword();
  return regEx.test(password);
};

export const formHasChange = (fields: object) => {
  const changes = Object.values(fields);
  return changes.some((change) => change);
};

export const formChangeValue = (fields: any, values: any) => {
  const changes = { ...fields };
  const items = Object.keys(changes);
  items.forEach((item) => (changes[item] = values[item]));
  return changes;
};
