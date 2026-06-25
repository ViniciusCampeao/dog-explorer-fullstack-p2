import SearchForm from './SearchForm.jsx'
import BreedCard from './BreedCard.jsx'
import BreedList from './BreedList.jsx'
import SearchHistory from './SearchHistory.jsx'
import Loading from './Loading.jsx'
import ErrorMessage from './ErrorMessage.jsx'
import ImageGallery from './ImageGallery.jsx'
import DogRecords from './DogRecords.jsx'
import { useAnimal } from '../contexts/AnimalContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function App() {
  const { loading, error, randomImage } = useAnimal()
  const { user, logout } = useAuth()

  return (
    <main className="page">
      <section className="hero">
        <div>
          <h1>Dog Explorer</h1>
          <p className="subtitle">
            Consulte raças de cachorros, veja imagens e acompanhe seu histórico de buscas.
          </p>
        </div>
        <div className="hero-user">
          <span>{user?.username}</span>
          <button className="secondary-button" onClick={logout}>Sair</button>
        </div>
      </section>

      <section className="layout">
        <div className="left-column">
          <SearchForm />
          <SearchHistory />
          <BreedList />
        </div>

        <div className="right-column">
          {loading && <Loading />}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && randomImage && <BreedCard />}
          {!loading && !error && randomImage && <ImageGallery />}

          {!loading && !error && !randomImage && (
            <div className="empty-state">
              <h2>Nenhuma raça pesquisada ainda</h2>
              <p>Digite uma raça no campo de busca ou escolha uma opção da lista.</p>
            </div>
          )}
        </div>
      </section>

      <DogRecords />
    </main>
  )
}
