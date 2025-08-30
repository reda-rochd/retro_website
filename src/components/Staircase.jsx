import wall1 from '../assets/wall_1.png'
import wall2 from '../assets/wall_2.png'
import wall3 from '../assets/wall_3.png'
import floor1 from '../assets/floor_1.png'
import floor2 from '../assets/floor_2.png'
import floor3 from '../assets/floor_3.png'
import floor4 from '../assets/floor_4.png'
import floor5 from '../assets/floor_5.png'
import floor6 from '../assets/floor_6.png'
import floor7 from '../assets/floor_7.png'
import floor8 from '../assets/floor_8.png'

export default function Staircase() {
  return (
	<div className="absolute w-screen h-screen z-10">
		<div>
			<div className="flex">
				<img src={floor1} className="w-5 h-5" />
				<img src={floor2} className="w-5 h-5" />
			</div>
			<div>
				<img src={floor3} className="w-5 h-5" />
			</div>
		</div>
		<div className="absolute top-0 right-0 flex">
			<img src={wall2} className="w-5 h-5" />
			<img src={wall1} className="w-5 h-5" />
		</div>
		<div className="absolute bottom-0 left-0">
			<img src={floor4} className="w-5 h-5" />
			<img src={floor5} className="w-5 h-5" />
		</div>
		<div className="absolute bottom-0 right-0 flex">
			<img src={floor8} className="w-5 h-5" />
		</div>
	</div>
  )
}
