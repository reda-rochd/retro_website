export default function CenteredLayout({ children }) {
	return (
		<div className="flex items-center justify-center h-[calc(100vh-2px)]">
			<div className="flex flex-col justify-center items-center h-[75vh] overflow-hidden max-w-md mx-auto text-center gap-6 bg-primary/85 rounded-[var(--radius)] shadow-lg px-10">
				{children}
			</div>
		</div>
	);
}
