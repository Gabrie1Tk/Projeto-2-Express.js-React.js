const mongoose = require('mongoose')

const showSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  genres:    [String],
  status:    { type: String },
  premiered: { type: String },
  rating:    { type: Number },
  summary:   { type: String },
  image:     { type: String },
  owner:     { type: String, required: true },
}, { timestamps: true })

const Show = mongoose.model('Show', showSchema)

const fetchPage = async (page) => {
  const res = await fetch(`https://api.tvmaze.com/shows?page=${page}`)
  if (!res.ok) return []
  return await res.json()
}

const seed = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://mongodb:27017/resource_db'
    await mongoose.connect(uri)
    console.log('[seed] MongoDB conectado')

    const existing = await Show.countDocuments({ owner: 'system' })
    if (existing > 0) {
      console.log(`[seed] Banco já possui ${existing} shows. Pulando.`)
      process.exit(0)
    }

    console.log('[seed] Buscando shows da TVMaze...')
    const allShows = []

    for (let page = 0; page < 4; page++) {
      const data = await fetchPage(page)
      if (!data.length) break
      const mapped = data.map(s => ({
        name:      s.name,
        genres:    s.genres || [],
        status:    s.status || '',
        premiered: s.premiered || '',
        rating:    s.rating?.average || null,
        summary:   s.summary ? s.summary.replace(/<[^>]+>/g, '') : '',
        image:     s.image?.medium || '',
        owner:     'system',
      }))
      allShows.push(...mapped)
      console.log(`[seed] Página ${page} — ${mapped.length} shows`)
    }

    await Show.insertMany(allShows)
    console.log(`[seed] ✅ ${allShows.length} shows inseridos!`)
    process.exit(0)

  } catch (err) {
    console.error('[seed] Erro:', err.message)
    process.exit(1)
  }
}

seed()