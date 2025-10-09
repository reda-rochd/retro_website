export default function Forbidden() {
	return (
		<div className="flex justify-center h-[calc(100vh_-_2px)] overflow-hidden max-w-md mx-auto text-center flex-col gap-6 bg-primary/85 rounded-[var(--radius)] shadow-lg px-2">
			<h1 className="text-2xl">403 Forbidden</h1>
			<p>You do not have permission to access this page.</p>
		</div>
	);
}
