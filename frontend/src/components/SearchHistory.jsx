import { useAnimal } from '../contexts/AnimalContext.jsx'

export default function SearchHistory() {
  const { history, searchBreed, clearHistory } = useAnimal()

  return (
    <section className="card">
      <div className="section-title-row">
        <h2>Histórico</h2>
        {history.length > 0 && (
          <button className="link-button" onClick={clearHistory}>
            Limpar
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="card-description">As últimas raças pesquisadas aparecerão aqui.</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <button key={item} type="button" onClick={() => searchBreed(item)}>
              {item}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
