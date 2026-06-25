import { useForm } from 'react-hook-form'
import { useAnimal } from '../contexts/AnimalContext.jsx'

export default function SearchForm() {
  const { searchBreed, breeds } = useAnimal()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  function onSubmit(data) {
    searchBreed(data.breed)
    reset()
  }

  return (
    <section className="card">
      <h2>Buscar raça</h2>
      <p className="card-description">Digite o nome de uma raça em inglês, como husky, pug ou beagle.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="search-form">
        <label htmlFor="breed">Raça</label>
        <input
          id="breed"
          type="text"
          list="breeds-list"
          placeholder="Ex: Husky"
          {...register('breed', {
            required: 'Informe uma raça para pesquisar.',
            minLength: {
              value: 2,
              message: 'Digite pelo menos 2 caracteres.',
            },
          })}
        />

        <datalist id="breeds-list">
          {breeds.map((item) => (
            <option key={`${item.breed}-${item.subBreed || 'main'}`} value={item.name} />
          ))}
        </datalist>

        {errors.breed && <span className="field-error">{errors.breed.message}</span>}

        <button type="submit">Buscar</button>
      </form>
    </section>
  )
}
