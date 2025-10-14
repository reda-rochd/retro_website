import { createPortal } from "react-dom"

export default function Modal({ children, onClose, open = true, className = "" }) {
	if (!open) return null;

	return createPortal(
		<div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[9999]">
			<div className="w-full max-w-md relative rounded-[var(--radius)] overflow-hidden">
				<div className={`max-h-[90vh] overflow-y-auto ${className}`}>
					<button
						onClick={onClose}
						className="bg-white w-10 h-10 rounded-full absolute top-4 right-4 text-red-600 cursor-pointer z-[10000]"
					>
						✕
					</button>
					{children}
				</div>
			</div>
		</div>,
		document.body
	)
}

