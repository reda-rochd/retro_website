import Hero from './Hero.jsx'
import Timeline from './Timeline.jsx'
import Organizers from './Organizers.jsx'
import Leaderboard from '../../components/Leaderboard.jsx'
import Section from '../../components/Section.jsx'

export default function Home() {
	return (
		<div className="space-y-15 my-10">
			<Hero />
			<Timeline/>
			<Organizers/>
		</div>
	)
}
