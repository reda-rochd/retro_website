export default function Organizers() {
	return (
		<div className="flex flex-col gap-8 max-w-[500px] mx-auto">
			<form className="flex gap-2 w-full">
				<input className="flex-1" type="text" placeholder="Login" />
				<input className="flex-1" type="text" placeholder="Category" />
				<input className="flex-1" type="text" placeholder="Role" />
				<button className="flex-1" type="submit">Add</button>
			</form>
		</div>
	);
}

