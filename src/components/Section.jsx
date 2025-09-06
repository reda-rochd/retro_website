import './Section.css'

export default function Section({ children }) {
	return (
		<section className="section neon-section">
			<span class="shine top-right"></span>
			<span class="glow top-right"></span>
			<span class="glow glow-bright top-right"></span>
			<span class="shine bottom-left"></span>
			<span class="glow bottom-left"></span>
			<span class="glow glow-bright bottom-left"></span>
			{children}
		</section>
	)
}
