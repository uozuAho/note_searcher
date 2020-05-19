/**
 * Formats the given epoch date into a YYYYMMddhhmm string, in UTC.
 * 
 * @param epochMs milliseconds since the epoch, 1970-01-01 00:00 UTC
 */
export const formatDateTime_YYYYMMddhhmm = (epochMs: number) => {
  // HACK ALERT: to output the same dateTime, regardless of local timezone:
  //
  // Date methods output values according to the local machine's timezone.
  // Eg. if we're in UTC+10, new Date(~00:00 UTC).getHours() will
  // output 10.
  // Date.getTimezoneOffset() outputs (UTC time - local time) in minutes,
  // eg. for UTC+10, will output -600.
  //
  // the hack: adjust the epoch time to ensure that the output is UTC, since
  // epoch ms is milliseconds since 1970-01-01 00:00 UTC
  //
  // getHours in UTC = new Date(epoch now + offset).getHours()
  const localOffsetMinutes = new Date(epochMs).getTimezoneOffset();
  const localOffsetMs = localOffsetMinutes * 60 * 1000;
  const localEpochMs = epochMs + localOffsetMs;

  const now = new Date(localEpochMs);

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');

  return `${year}${month}${day}${hour}${minute}`;
};
