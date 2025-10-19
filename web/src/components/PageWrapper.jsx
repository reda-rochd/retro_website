import { motion, useReducedMotion } from 'framer-motion';

export default function PageWrapper({ children }) {
	const prefersReducedMotion = useReducedMotion();

	const transition = { duration: 0.5, ease: [0.4, 0, 0.2, 1] };
	const initial = prefersReducedMotion ? { opacity: 1 } : { opacity: 0, filter: 'blur(12px)', y: 24 };
	const animate = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)', y: 0 };
	const exit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(12px)', y: -24 };

	return (
		<motion.main
			layout
			initial={initial}
			animate={animate}
			exit={exit}
			transition={transition}
			style={{
				minHeight: '100vh',
				willChange: 'transform, opacity, filter'
			}}
		>
			{children}
		</motion.main>
	);
}
