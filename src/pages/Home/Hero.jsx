import background from '../../assets/hero_background.jpg'

export default function Hero() {
	return (
		<section className="relative py-20 text-center text-white bg-cover bg-center" style={{ imageRendering: 'pixelated', backgroundImage: `url(${background})`,	}}>
			<div className="absolute inset-0 bg-black/60"></div>
				<span className="absolute inset-0 mt-2 text-white">1337</span>
				<div className="relative">
					<h1 className="text-white text-4xl font-bold">Integration week</h1>
					<a href="#get-started" className="btn-primary mt-4 inline-block">Get Started</a>
				</div>
		</section>
	)
}

