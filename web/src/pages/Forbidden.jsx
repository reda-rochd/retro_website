export default function Forbidden() {
	return (
		<div className="flex items-center justify-center h-screen">
			<div className="flex flex-col justify-center items-center h-[75vh] overflow-hidden max-w-md mx-auto text-center gap-6 bg-primary/85 rounded-[var(--radius)] shadow-lg px-10">
				<h1 className="text-2xl">403 Forbidden</h1>
				<p>You do not have permission to access this page.</p>
			</div>
		</div>
	);
}
