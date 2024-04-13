export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-UK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const convertQuery = (value: Record<string, string | undefined>) => {
  return Object.keys(value)
    .filter((key) => value[key])
    .map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(
        value[key] as string
      )}`;
    })
    .join('&');
};
