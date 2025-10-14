import CenteredLayout from '/src/components/CenteredLayout';

export default function Forbidden() {
	return (
		<CenteredLayout>
				<h1 className="text-2xl">403 Forbidden</h1>
				<p>You do not have permission to access this page.</p>
		</CenteredLayout>
	);
}
