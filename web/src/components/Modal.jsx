export default function Modal({ children, onClose }) {
	return (
		<div className="fixed inset-0 bg-black/75 flex items-center justify-center">
			<div className="bg-secondary rounded-[var(--radius)] p-6 w-full max-w-md relative">
				<button
					onClick={onClose}
					className="bg-white w-10 h-10 rounded-full absolute top-3 right-3 text-red-500"
				>
					✕
				</button>
				{children}
			</div>
		</div>
	)
}
