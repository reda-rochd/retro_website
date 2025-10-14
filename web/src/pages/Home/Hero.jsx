import './Hero.css'
import {Link} from 'react-router-dom'
import CTA from '/src/components/CTA.jsx'
import {useAuth} from '/src/contexts/AuthContext.jsx'

export default function Hero() {
	const { user } = useAuth()
	return (
		<section className="hero relative text-center text-white bg-cover bg-center max-w-4xl inset-0 mx-auto">
			<div className="flex flex-col gap-7 items-center">
				<h1 className="mt-5 headline text-white text-[clamp(2rem,10vw,5rem)] blinker">I<span>nt</span>egrat<span>i</span>on we<span>ek</span></h1>
				<p className="text-lg w-[clamp(20rem,50%,40rem)]">a time for everyone to come together meet new people share experiences and feel part of the community.</p>
				{user && ( <CTA href="/profile" text={`Welcome, ${user.first_name}. Check out your profile.`} /> )}
				{!user && ( 
					<a href={user ? `/` : `/api/auth/42/login`} className=" cta w-fit m-auto mt-7" >
						{user ? 'Go to Home' : 'Sign in with 42'}
					</a>
				)}
			</div>
		</section>
	)
}

