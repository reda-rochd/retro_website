import './Section.css'
import { forwardRef } from "react"

export default function Section({ children, className = "", ...props }) {
	return (
		<section
			className={`section neon-section min-h-[500px] ${className}`}
			{...props}
		>
			<span className="shine top-right"></span>
			<span className="glow top-right"></span>
			<span className="glow glow-bright top-right"></span>
			<span className="shine bottom-left"></span>
			<span className="glow bottom-left"></span>
			<span className="glow glow-bright bottom-left"></span>
			{children}
		</section>
	)
}
