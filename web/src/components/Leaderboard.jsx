import BlobShape from './BlobShape.jsx';
import { Link } from 'react-router-dom';

export default function Leaderboard({
	items,
	rank = true,
	getUrl,
	getAvatarUrl,
	getTitle,
	getSubtitle,
	renderRight,
}) {
	return (
		<div className="flex flex-col gap-6">
			{items.map((item, index) => {
				const url = getUrl ? getUrl(item) : item?.url;
				const isExternal = typeof url === 'string' && url.startsWith('http');
				const isInternal = typeof url === 'string' && !isExternal;

				const Wrapper = url ? (isExternal ? 'a' : isInternal ? Link : 'div') : 'div';
				const wrapperProps = url
					? isExternal
						? { href: url, target: '_blank', rel: 'noopener noreferrer' }
						: isInternal
						? { to: url }
						: {}
					: {};

				const avatarUrl = getAvatarUrl ? getAvatarUrl(item) : item?.avatar_url;
				const title = getTitle
					? getTitle(item)
					: item?.title || item?.name || item?.login || '';
				const subtitle = getSubtitle ? getSubtitle(item) : undefined;

				return (
					<Wrapper
						key={index}
						{...wrapperProps}
						className={`flex justify-between items-center bg-white/5 rounded-lg px-4 ${
							url ? 'hover:bg-white/10 transition-colors cursor-pointer' : ''
						}`}
					>
						<div className="flex items-center gap-4">
							{rank && <span>#{index + 1}</span>}
							{avatarUrl && (
								<div className="h-10 flex items-center">
									<BlobShape avatar={avatarUrl} size={60} />
								</div>
							)}
							<div className="flex flex-col leading-tight">
								<h3 className="text-base font-medium">{title}</h3>
								{subtitle && (
									<span className="text-xs text-white/70">{subtitle}</span>
								)}
							</div>
						</div>
						<span className="flex items-baseline gap-2">
							{renderRight ? renderRight(item, index) : null}
						</span>
					</Wrapper>
				);
			})}
		</div>
	);
}
