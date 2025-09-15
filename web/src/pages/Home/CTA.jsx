import { Link } from "react-router-dom";
import './CTA.css';

export default function CTA({ href, children }) {
	return (
		<Link to={href} className="cta" >{children}</Link>
	)
}
