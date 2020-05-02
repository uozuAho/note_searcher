export const formatDateTime_YYYYMMddhhmm = (epochMs: number) => {
  const now = new Date(epochMs);
  const year = now.getFullYear();
  let month = (now.getMonth() + 1).toString().padStart(2, '0');
  let day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');

  return `${year}${month}${day}${hour}${minute}`;
};
