import { useAnimal } from '../contexts/AnimalContext.jsx'

function formatName(breed, subBreed) {
  const name = subBreed ? `${subBreed} ${breed}` : breed

  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function BreedCard() {
  const { selectedBreed, selectedSubBreed, randomImage, images, changeRandomImage } = useAnimal()

  return (
    <section className="result-card">
      <div className="result-header">
        <div>
          <p className="tag">Resultado da busca</p>
          <h2>{formatName(selectedBreed, selectedSubBreed)}</h2>
        </div>
        <button className="secondary-button" onClick={changeRandomImage}>
          Trocar imagem
        </button>
      </div>

      <img className="main-dog-image" src={randomImage} alt={`Cachorro da raça ${selectedBreed}`} />

      <div className="info-grid">
        <div>
          <strong>Raça principal</strong>
          <span>{selectedBreed}</span>
        </div>
        <div>
          <strong>Sub-raça</strong>
          <span>{selectedSubBreed || 'Não possui'}</span>
        </div>
        <div>
          <strong>Imagens carregadas</strong>
          <span>{images.length}</span>
        </div>
      </div>
    </section>
  )
}
