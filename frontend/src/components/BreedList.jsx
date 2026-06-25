import { useMemo, useState } from 'react'
import { useAnimal } from '../contexts/AnimalContext.jsx'

export default function BreedList() {
  const { breeds, searchBreed } = useAnimal()
  const [filter, setFilter] = useState('')

  const filteredBreeds = useMemo(() => {
    const normalizedFilter = filter.toLowerCase().trim()

    if (!normalizedFilter) {
      return breeds.slice(0, 12)
    }

    return breeds.filter((item) => item.name.toLowerCase().includes(normalizedFilter)).slice(0, 12)
  }, [breeds, filter])

  return (
    <section className="card">
      <h2>Raças disponíveis</h2>
      <p className="card-description">Filtre e clique em uma raça para pesquisar rapidamente.</p>

      <input
        className="filter-input"
        type="text"
        placeholder="Filtrar lista..."
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      />

      <div className="breed-list">
        {filteredBreeds.map((item) => (
          <button
            key={`${item.breed}-${item.subBreed || 'main'}`}
            type="button"
            onClick={() => searchBreed(item.name)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </section>
  )
}
