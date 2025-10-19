import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion) {
			window.scrollTo(0, 0);
			return;
		}

		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [pathname]);

	return null;
}
