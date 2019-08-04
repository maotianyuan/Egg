'use strict';

function handlerExceelTime(days) {
  if (!days) return days;
  const date = new Date('1900-01-01');
  days -= 2;
  date.setDate(date.getDate() + days);
  let month = date.getMonth() + 1;
  let day = date.getDate();
  const mm = "'" + month + "'";
  const dd = "'" + day + "'";
  if (mm.length === 3) {
    month = '0' + month;
  }
  if (dd.length === 3) {
    day = '0' + day;
  }
  const time = date.getFullYear() + '-' + month + '-' + day;
  return time;
}
module.exports = {
  handlerExceelTime,
};

