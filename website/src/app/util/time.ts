import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);
export function timeCompare(
  setTime: string,
  currentTime: string | Date = new Date(),
) {
  return dayjs(setTime).isAfter(dayjs(currentTime));
}

export function dateToStr(str: string | Date) {
  return dayjs(str).format('YYYY-MM-DD HH:mm');
}
export function formatDatetimeToStr(str?: string) {
  if (!str) {
    return '';
  }
  return dateToStr(str);
}

export function dateRangeToStr(range: [Date, Date]) {
  const start = dayjs(range[0]);
  const end = dayjs(range[1]);

  if (start.year() === end.year()) {
    return `${start.year()}-${start.format('MM-DD')} - ${end.format('MM-DD')}`;
  } else {
    return `${start.format('YYYY-MM-DD')} - ${end.format('YYYY-MM-DD')}`;
  }
}
export function dateInRange(input: string | Date, range: [Date, Date]) {
  const instance = dayjs(input);
  return instance.isSameOrAfter(range[0]) && instance.isBefore(range[1]);
}

export function toDateStr(date: Date) {
  return dayjs(date).format('YYYY-MM-DD');
}
