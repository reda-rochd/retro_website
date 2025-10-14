import { motion } from 'framer-motion';

export default function PageWrapper({ children }) {
	return (
		<motion.div
			key={window.location.pathname}
			initial={{ scale: 0.95, opacity: 0, filter: "blur(20px)" }}
			animate={{ scale: 1, opacity: 1, filter: "blur(0)" }}
			exit={{ scale: 0.95, opacity: 0, filter: "blur(20px)" }}
			transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
			style={{
				minHeight: '100vh',
				willChange: 'transform, opacity, filter',
				backfaceVisibility: 'hidden',
				transformStyle: 'preserve-3d'
			}}
		>
			{children}
		</motion.div>
	);
}
