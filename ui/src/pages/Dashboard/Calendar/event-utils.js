let eventGuid = 0;
const today = new Date();
const y = today.getFullYear();
const m = today.getMonth();
const d = today.getDate();

export const INITIAL_EVENTS = [
  {
    title: 'All Day Event',
    start: new Date(y, m, 1),
    className: 'event-default',
  },
  {
    id: 999,
    title: 'Repeating Event',
    start: new Date(y, m, d - 4, 6, 0),
    allDay: false,
    className: 'event-rose',
  },
  {
    id: 999,
    title: 'Repeating Event',
    start: new Date(y, m, d + 3, 6, 0),
    allDay: false,
    className: 'event-rose',
  },
  {
    title: 'Meeting',
    start: new Date(y, m, d - 1, 10, 30),
    allDay: false,
    className: 'event-green',
  },
  {
    title: 'Lunch',
    start: new Date(y, m, d + 7, 12, 0),
    end: new Date(y, m, d + 7, 14, 0),
    allDay: false,
    className: 'event-red',
  },
  {
    title: 'Md-pro Launch',
    start: new Date(y, m, d - 2, 12, 0),
    allDay: true,
    className: 'event-azure',
  },
  {
    title: 'Birthday Party',
    start: new Date(y, m, d + 1, 19, 0),
    end: new Date(y, m, d + 1, 22, 30),
    allDay: false,
    className: 'event-azure',
  },
  {
    title: 'Flux',
    start: new Date(y, m, 21),
    end: new Date(y, m, 22),
    url: 'https://runonflux.io/',
    className: 'event-orange',
  },
  {
    title: 'Flux',
    start: new Date(y, m, 21),
    end: new Date(y, m, 22),
    url: 'https://runonflux.io/',
    className: 'event-orange',
  },
];

export function createEventId() {
  return String(eventGuid++);
}
