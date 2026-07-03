export default function Spinner({ center = true }) {
  if (!center) return <span className="spinner" />;
  return (
    <div className="spinner-center">
      <span className="spinner" />
    </div>
  );
}
