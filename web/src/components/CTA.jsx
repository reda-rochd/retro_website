import { Link } from "react-router-dom";
import './CTA.css';

export default function CTA({ href, text, className="" }) {
	return (
		<a href={href} className={`cta ${className}`}>{text}</a>
	)
}

// TODO: tailwind group
// <Link
// 	class="relative px-[50px] py-[5px] border border-[#ccc] rounded-[5%_/_100%]
// 	shadow-[0_0_5px_var(--color-accent-flamingo-queen),inset_0_0_5px_var(--color-accent-flamingo-queen)]
// 	transition-all duration-300 ease-in group overflow-hidden"
// >
// 	<span
// 		class="absolute top-0 bottom-0 left-[-12%] w-[125%]
// 		bg-[radial-gradient(circle,var(--color-accent-flamingo-queen)_0%,#0000_110%)]
// 		filter blur-[15px] opacity-30 transition-all duration-300 ease-in
// 		- z-[-1] group-hover:opacity-50"
// 	></span>
// 	Call to Action
// </Link>
