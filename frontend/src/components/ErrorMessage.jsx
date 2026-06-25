export default function ErrorMessage({ message }) {
  return (
    <div className="error-card">
      <h2>Ops, algo deu errado</h2>
      <p>{message}</p>
    </div>
  )
}
