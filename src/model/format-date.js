const formatDate = (date, hourAndMinute) => {

	let hourItem = (typeof hourAndMinute == 'string') ? hourAndMinute : JSON.stringify(hourAndMinute)
	let tsString = (typeof date == 'string') ? date : JSON.stringify(date)

	let year = tsString[0] + tsString[1] + tsString[2] + tsString[3]
	let month = tsString[4] + tsString[5]
	let day = tsString[6] + tsString[7]
	let sec = '00'
	let hour = ""
	let min = ""

	if (hourItem[0] != '"') {
		hour = (hourItem.length == 5) ? '0' + hourItem[0] : hourItem[0] + hourItem[1]
		min = hourItem[2] + hourItem[3]
	}
	else {
		hour = (hourItem.length == 5) ? '0' + hourItem[1] : hourItem[1] + hourItem[2]
		min = hourItem[3] + hourItem[4]
	}

	let completeTimestamp = day + "/" + month + "/" + year + " - " + hour + ":" + min + ":" + sec
	let completeDate = day + "/" + month + "/" + year
	hourMin = hour + ":" + min

	return {
		completeTimestamp: completeTimestamp,
		completeDate: completeDate,
		year: parseInt(year),
		month: parseInt(month),
		day: parseInt(day),
		hour: parseInt(hour),
		min: parseInt(min),
		sec: parseInt(sec),
		hourMin: hourMin,
		monthDay: day + "/" + month,
		yearMonth: month + "/" + year
	}

}

module.exports.formatDate = formatDate