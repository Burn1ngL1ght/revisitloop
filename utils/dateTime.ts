export function parseLocalDateTime(
  dateText: string,
  timeText: string,
  use24HourTime = false,
): number | null {
  const dateMatch = dateText
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!dateMatch) {
    return null;
  }

  const monthText = dateMatch[1];
  const dayText = dateMatch[2];
  const yearText = dateMatch[3];

  if (!monthText || !dayText || !yearText) {
    return null;
  }

  const month = Number(monthText);
  const day = Number(dayText);
  const year = Number(yearText);

  let hour: number;
  let minute: number;

  if (use24HourTime) {
    const timeMatch = timeText
      .trim()
      .match(/^(\d{1,2}):(\d{2})$/);

    if (!timeMatch) {
      return null;
    }

    const hourText = timeMatch[1];
    const minuteText = timeMatch[2];

    if (!hourText || !minuteText) {
      return null;
    }

    hour = Number(hourText);
    minute = Number(minuteText);

    if (
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }
  } else {
    const timeMatch = timeText
      .trim()
      .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    if (!timeMatch) {
      return null;
    }

    const hourText = timeMatch[1];
    const minuteText = timeMatch[2];
    const periodText = timeMatch[3];

    if (!hourText || !minuteText || !periodText) {
      return null;
    }

    hour = Number(hourText);
    minute = Number(minuteText);

    const period = periodText.toUpperCase();

    if (
      hour < 1 ||
      hour > 12 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    if (period === 'PM' && hour !== 12) {
      hour += 12;
    }
  }

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const date = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0,
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date.getTime();
}

export function formatLocalDateTime(
  timestamp: number,
  use24HourTime: boolean,
): string {
  const date = new Date(timestamp);

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: use24HourTime
      ? 'h23'
      : 'h12',
  });
}

export function formatDateTimeForInput(
  timestamp: number,
  use24HourTime: boolean,
): {
  dateText: string;
  timeText: string;
} {
  const date = new Date(timestamp);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  const minute = String(date.getMinutes()).padStart(2, '0');

  const dateText = `${month}/${day}/${year}`;

  if (use24HourTime) {
    const hour = String(date.getHours()).padStart(2, '0');

    return {
      dateText,
      timeText: `${hour}:${minute}`,
    };
  }

  const hour24 = date.getHours();
  const period = hour24 >= 12 ? 'PM' : 'AM';

  const hour12 = hour24 % 12 || 12;

  return {
    dateText,
    timeText: `${hour12}:${minute} ${period}`,
  };
}