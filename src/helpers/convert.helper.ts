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

export const downloadFile = (href: string, name: string) => {
  const anchor = document.createElement('a');
  (anchor.href = href), (anchor.download = name);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};
