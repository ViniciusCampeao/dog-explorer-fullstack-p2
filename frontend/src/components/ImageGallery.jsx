import { useAnimal } from '../contexts/AnimalContext.jsx'

export default function ImageGallery() {
  const { images, selectedBreed } = useAnimal()

  return (
    <section className="gallery-card">
      <h2>Galeria</h2>
      <div className="gallery-grid">
        {images.map((image) => (
          <img key={image} src={image} alt={`Imagem da raça ${selectedBreed}`} />
        ))}
      </div>
    </section>
  )
}
