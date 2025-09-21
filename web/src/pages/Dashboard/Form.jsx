export default function Form({ children, onSave}) {
	const submit = (e) => {
		e.preventDefault()
		const formData = new FormData(e.target)
		const data = Object.fromEntries(formData.entries())
		onSave(data)
		e.target.reset()
	}

	return (
		<form onSubmit={submit} className="flex flex-col gap-4">
			{children}
		</form>
	)
}

