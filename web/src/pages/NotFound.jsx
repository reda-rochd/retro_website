export default function NotFound() {
	return (
		<div className="flex items-center justify-center h-screen">
			<div className="flex flex-col justify-center items-center h-[75vh] overflow-hidden max-w-md mx-auto text-center gap-6 bg-primary/85 rounded-[var(--radius)] shadow-lg px-10">
				<h1 className="text-2xl">404 Not Found</h1>
				<p>Sorry, the page you are looking for does not exist.</p>
			</div>
		</div>
	)
}
