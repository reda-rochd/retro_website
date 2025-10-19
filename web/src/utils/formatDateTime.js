export function formatDateTime(dateLike) {
	const date = dateLike instanceof Date
		? new Date(dateLike.getTime())
		: new Date(dateLike);
	if (Number.isNaN(date.getTime())) return '';
	const formattedDate = date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	return `${formattedDate} ${hours}:${minutes}`;
}

export function formatDateRange(startLike, endLike) {
	const start = startLike ? new Date(startLike) : null;
	const end = endLike ? new Date(endLike) : null;
	if (!start || Number.isNaN(start.getTime())) return '';
	if (!end || Number.isNaN(end.getTime())) return formatDateTime(start);

	const sameDay = start.getFullYear() === end.getFullYear()
		&& start.getMonth() === end.getMonth()
		&& start.getDate() === end.getDate();

	if (sameDay) {
		const base = start.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
		const startTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
		const endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
		return `${base} ${startTime} – ${endTime}`;
	}

	return `${formatDateTime(start)} → ${formatDateTime(end)}`;
}
