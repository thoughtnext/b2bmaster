var moment = require('moment');

function getLastWeek() {
  var start_time = moment().subtract(1, 'weeks').startOf('isoWeek').format("YYYY-MM-DD HH:mm:ss")
  var end_time = moment().subtract(1, 'weeks').endOf('isoWeek').format("YYYY-MM-DD HH:mm:ss")
  console.log(start_time, end_time)
  return [start_time,end_time]
}


function getToday() {
  var start_time = moment().startOf('day').format("YYYY-MM-DD HH:mm:ss")
  var end_time = moment().endOf('day').format("YYYY-MM-DD HH:mm:ss")
  console.log(start_time, end_time)
  return [start_time,end_time]
}

function getYesterday() {
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  var start_time = moment(yesterday).startOf('day').format("YYYY-MM-DD HH:mm:ss")
  var end_time = moment(yesterday).endOf('day').format("YYYY-MM-DD HH:mm:ss")
  console.log(start_time, end_time)
}

function getLastMonth() {
  var last_month = new Date();
  last_month.setMonth(last_month.getMonth() - 1);
  var start_time = moment(last_month).startOf('month').format("YYYY-MM-DD HH:mm:ss")
  var end_time = moment(last_month).endOf('month').format("YYYY-MM-DD HH:mm:ss")
  console.log(start_time, end_time)
  return [start_time,end_time]
}

exports.getLastWeek = getLastWeek
exports.getToday = getToday
exports.getYesterday = getYesterday
exports.getLastMonth = getLastMonth
