import background from '../../assets/hero_background.jpg'
import './Hero.css'
import CTA from './CTA.jsx'

export default function Hero() {
	return (
		<section className="relative text-center text-white bg-cover bg-center" >
			<span className="absolute left-0 right-0 mt-2 text-white">1337</span>
			<div className="py-10 flex flex-col gap-7 items-center">
				<h1 className="mt-5 headline text-white text-[clamp(2rem,10vw,5rem)] blinker">I<span>nt</span>egrat<span>i</span>on we<span>ek</span></h1>
				<p className="text-sm w-[clamp(20rem,50%,40rem)]">a time for everyone to come together meet new people share experiences and feel part of the community.</p>
				<CTA href="/register">Sign in with your intra</CTA>
			</div>
		</section>
	)
}

