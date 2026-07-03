const ESTADO_MAP = {
  pendente: { tone: 'warn', label: 'pendente' },
  pago: { tone: 'ok', label: 'pago' },
  enviado: { tone: 'ok', label: 'enviado' },
  entregue: { tone: 'ok', label: 'entregue' },
  cancelado: { tone: 'bad', label: 'cancelado' }
};

export function EstadoPill({ estado }) {
  const info = ESTADO_MAP[estado] || { tone: 'neutral', label: estado || '—' };
  return (
    <span className={`pill pill-${info.tone}`}>
      <span className="led" />
      {info.label}
    </span>
  );
}

export function StockPill({ stock }) {
  let tone = 'ok';
  let label = `${stock} em stock`;
  if (stock === 0) {
    tone = 'bad';
    label = 'esgotado';
  } else if (stock <= 5) {
    tone = 'warn';
    label = `${stock} restantes`;
  }
  return (
    <span className={`pill pill-${tone}`}>
      <span className="led" />
      {label}
    </span>
  );
}
