import { useState } from 'react'
import { useDogs } from '../contexts/DogsContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

function DogForm({ initial = {}, onSubmit, onCancel }) {
  const [name, setName] = useState(initial.name || '')
  const [breed, setBreed] = useState(initial.breed || '')
  const [subBreed, setSubBreed] = useState(initial.subBreed || '')
  const [imageUrl, setImageUrl] = useState(initial.imageUrl || '')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await onSubmit({ name, breed, subBreed, imageUrl })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="dog-form" onSubmit={handleSubmit}>
      <div className="dog-form-fields">
        <input placeholder="Nome *" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Raça *" value={breed} onChange={(e) => setBreed(e.target.value)} required />
        <input placeholder="Sub-raça" value={subBreed} onChange={(e) => setSubBreed(e.target.value)} />
        <input placeholder="URL da imagem" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="dog-form-actions">
        <button type="submit">Salvar</button>
        {onCancel && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

function DogRow({ dog }) {
  const { updateDog, deleteDog } = useDogs()
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const isOwner = user?.id === dog.ownerId

  async function handleUpdate(data) {
    await updateDog(dog._id, data)
    setEditing(false)
  }

  async function handleDelete() {
    if (!window.confirm(`Excluir "${dog.name}"?`)) return
    await deleteDog(dog._id)
  }

  if (editing) {
    return (
      <li className="dog-row dog-row--editing">
        <DogForm initial={dog} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
      </li>
    )
  }

  return (
    <li className="dog-row">
      <div className="dog-row-info">
        {dog.imageUrl && <img src={dog.imageUrl} alt={dog.name} className="dog-row-thumb" />}
        <div>
          <strong>{dog.name}</strong>
          <span>
            {dog.breed}
            {dog.subBreed ? ` / ${dog.subBreed}` : ''}
          </span>
        </div>
      </div>
      {isOwner && (
        <div className="dog-row-actions">
          <button className="secondary-button" onClick={() => setEditing(true)}>
            Editar
          </button>
          <button className="secondary-button danger" onClick={handleDelete}>
            Excluir
          </button>
        </div>
      )}
    </li>
  )
}

export default function DogRecords() {
  const { dogs, createDog } = useDogs()
  const [creating, setCreating] = useState(false)

  async function handleCreate(data) {
    await createDog(data)
    setCreating(false)
  }

  return (
    <section className="card records-section">
      <div className="section-title-row">
        <h2>Registros</h2>
        {!creating && (
          <button className="secondary-button" onClick={() => setCreating(true)}>
            + Novo
          </button>
        )}
      </div>

      {creating && <DogForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />}

      {dogs.length === 0 && !creating && (
        <p style={{ color: '#637083' }}>Nenhum registro ainda.</p>
      )}

      {dogs.length > 0 && (
        <ul className="dog-list">
          {dogs.map((dog) => (
            <DogRow key={dog._id} dog={dog} />
          ))}
        </ul>
      )}
    </section>
  )
}
