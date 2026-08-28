function Loading({ message = "Cargando..." }) {
  return <div className="loading" role="status">{message}</div>;
}

export default Loading;