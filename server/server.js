import express from "express"
// import cors from "cors"

const app = express()
// app.use(cors())
app.use(express.json())

let events = [
	{
		id: 1,
		name: "Quidditch",
		date: "2023-10-01",
		description: "This is the first event.",
		location: "Hogwarts",
		createdAt: "2023-09-01",
		games: [
			{
				name: "Hoops",
				score: 32,
			},
		]
	},
	{
		id: 2,
		name: "Field Games",
		date: "2024-10-01",
		description: "This is the second event.",
		location: "Zurich",
		createdAt: "2024-09-01",
		games: [
			{
				name: "Oulala",
				score: 32,
			},
			{
				name: "zogala",
				score: 27,
			}
		]
	},
]
let nextId = events.length + 1


let teams = [
	{
		id: 1,
		name: "Team A",
		members: [
			{
				login: "aalice",
				avatarUrl: "https://i.pravatar.cc/150?u=alice",
			},
			{
				login: "nbob",
				avatarUrl: "https://i.pravatar.cc/150?u=bob",
			}
		]
	},
	{
		id: 2,
		name: "Team B",
		members: [
			{
				login: "bcharlie",
				avatarUrl: "https://i.pravatar.cc/150?u=charlie",
			},
			{
				login: "zdavid",
				avatarUrl: "https://i.pravatar.cc/150?u=david",
			}
		]
	},
]


app.get("/api/events", (req, res) => {
  res.json(events)
})

app.post("/api/events", (req, res) => {
  const event = { ...req.body, id: nextId++ }
  events.push(event)
  res.json(event)
})

app.put("/api/events/:id", (req, res) => {
  const id = Number(req.params.id)
  const index = events.findIndex(e => e.id === id)
  if (index === -1) return res.status(404).json({ error: "Event not found" })
  events[index] = { ...events[index], ...req.body }
  res.json(events[index])
})

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001")
})

