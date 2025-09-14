import Hero from './Hero.jsx'
import Timeline from './Timeline.jsx'
import Organizers from './Organizers.jsx'
import Leaderboard from '../../components/Leaderboard.jsx'
import Section from '../../components/Section.jsx'

export default function Home() {
	return (
		<>
			<Hero />
			<Timeline events={[
				{
					date: '2022-02-14',
					name: 'A special event',
					description: 'The path stroke has thickness. If the path starts at y=0, half of the stroke is actually outside the SVG viewport. With even a 1px padding, the first control point moves down enough so the whole stroke is inside, no clipping.',
					avatar: 'https://thumbs.dreamstime.com/z/stylish-abstract-modern-background-blue-white-red-watercolor-ink-water-powerful-explosion-colors-cool-trending-171424933.jpg?ct=jpeg'
				},
				{
					date: '2023-02-14',
					name: 'Where events can have',
					description: 'The path stroke has thickness. If the path starts at y=0, half of the stroke is actually outside the SVG viewport. With even a 1px padding, the first control point moves down enough so the whole stroke is inside, no clipping.',
					avatar: 'https://thumbs.dreamstime.com/z/stylish-abstract-modern-background-blue-white-red-watercolor-ink-water-powerful-explosion-colors-cool-trending-171424933.jpg?ct=jpeg'
				},
				{
					date: '2024-02-14',
					name: 'A special event where events can have a very long title that might wrap onto multiple lines',
					description: 'The path stroke has thickness. If the path starts at y=0, half of the stroke is actually outside the SVG viewport. With even a 1px padding, the first control point moves down enough so the whole stroke is inside, no clipping.',
					avatar: 'https://thumbs.dreamstime.com/z/stylish-abstract-modern-background-blue-white-red-watercolor-ink-water-powerful-explosion-colors-cool-trending-171424933.jpg?ct=jpeg'
				},
				{
					date: '2025-02-14',
					name: 'A special event where events can have a very long title that might wrap onto multiple lines',
					description: 'The path stroke has thickness. If the path starts at y=0, half of the stroke is actually outside the SVG viewport. With even a 1px padding, the first control point moves down enough so the whole stroke is inside, no clipping.',
					avatar: 'https://thumbs.dreamstime.com/z/stylish-abstract-modern-background-blue-white-red-watercolor-ink-water-powerful-explosion-colors-cool-trending-171424933.jpg?ct=jpeg'
				},
				{
					date: '2026-02-14',
					name: 'A special event where events can have a very long title that might wrap onto multiple lines',
					description: 'The path stroke has thickness. If the path starts at y=0, half of the stroke is actually outside the SVG viewport. With even a 1px padding, the first control point moves down enough so the whole stroke is inside, no clipping.',
					avatar: 'https://thumbs.dreamstime.com/z/stylish-abstract-modern-background-blue-white-red-watercolor-ink-water-powerful-explosion-colors-cool-trending-171424933.jpg?ct=jpeg'
				},
			]} />


			<Section>
				<h2 className="">Leaderboard</h2>
				<Leaderboard leaders={[
					{ name: '3bas', points: 1500, avatar: 'https://avatars.githubusercontent.com/u/9635?s=200&v=4' },
					{ name: 'fernas', points: 1200, avatar: 'https://avatars.githubusercontent.com/u/9633?s=200&v=4' },
					{ name: 'herbola', points: 1100, avatar: 'https://avatars.githubusercontent.com/u/542948?s=200&v=4' },
					{ name: 'derbola', points: 900, avatar: 'https://avatars.githubusercontent.com/u/9637?s=200&v=4' },
					{ name: 'samir samira', points: 850, avatar: 'https://avatars.githubusercontent.com/u/9639?s=200&v=4' },
					{ name: 'habol', points: 800, avatar: 'https://avatars.githubusercontent.com/u/9644?s=400&v=4' },
					{ name: 'az9roooch', points: 750, avatar: 'https://avatars.githubusercontent.com/u/9645?s=400&v=4' },
					{ name: 'hadak howa ana', points: 700, avatar: 'https://avatars.githubusercontent.com/u/9646?s=400&v=4' },
					{ name: 'la ana howa', points: 650, avatar: 'https://avatars.githubusercontent.com/u/9647?s=400&v=4' },
					{ name: 'molakorf', points: 600, avatar: 'https://avatars.githubusercontent.com/u/9648?s=400&v=4' },
				]} />
			</Section>

			<Organizers organizers={[
				{
					avatar: 'https://avatars.githubusercontent.com/u/9635?s=200&v=4',
					name: 'mouad wold labes',
					role: 'mol l 3ssa'
				},
				{
					avatar: 'https://avatars.githubusercontent.com/u/9633?s=200&v=4',
					name: 'mostapha abu soph',
					role: 'mol derboga'
				},
				{
					avatar: 'https://avatars.githubusercontent.com/u/542948?s=200&v=4',
					name: 'lambda and djiktra',
					role: 'mol l3ziza'
				},
				{
					avatar: 'https://avatars.githubusercontent.com/u/9637?s=200&v=4',
					name: 'mouad wold labes',
					role: '7yad derra'
				},
				{
					avatar: 'https://avatars.githubusercontent.com/u/9639?s=200&v=4',
					name: 'mostapha abu soph',
					role: 'bo 7a'
				},
				{
					avatar: 'https://avatars.githubusercontent.com/u/9644?s=400&v=4',
					name: 'lambda and djiktra',
					role: 'zininini'
				}
			]}/>
		</>
	)
}
