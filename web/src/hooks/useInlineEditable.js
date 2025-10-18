import { useCallback, useEffect, useState } from 'react';

export function useInlineEditable(value, { onSave, validate } = {}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value ?? '');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!editing) setDraft(value ?? '');
	}, [value, editing]);

	const start = useCallback(() => {
		setEditing(true);
		setError(null);
	}, []);

	const cancel = useCallback(() => {
		setEditing(false);
		setDraft(value ?? '');
		setError(null);
	}, [value]);

	const submit = useCallback(async (event) => {
		event?.preventDefault();
		if (!editing || saving) return;
		const next = draft.trim();
		const validationMessage = validate?.(next);
		if (validationMessage) {
			setError(validationMessage);
			return;
		}
		if (next === (value ?? '')) {
			setEditing(false);
			return;
		}
		try {
			setSaving(true);
			await onSave?.(next);
			setEditing(false);
		} catch (err) {
			const message = err?.response?.data?.error || err?.message || 'Failed to save changes';
			setError(message);
		} finally {
			setSaving(false);
		}
	}, [editing, saving, draft, validate, value, onSave]);

	return {
		editing,
		draft,
		setDraft,
		start,
		cancel,
		submit,
		saving,
		error
	};
}