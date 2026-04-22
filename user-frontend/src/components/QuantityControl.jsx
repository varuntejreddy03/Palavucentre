import { Minus, Plus } from 'lucide-react'

export default function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
  size = 'md',
  className = '',
}) {
  const compact = size === 'sm'

  return (
    <div
      className={`inline-flex items-center rounded-[10px] border border-[var(--border-strong)] bg-[var(--gold-surface)] p-1 ${className}`}
    >
      <button
        type="button"
        onClick={onDecrease}
        className={`flex items-center justify-center rounded-[8px] bg-[var(--gold)] text-[#140d05] transition hover:bg-[var(--gold-light)] active:scale-95 ${
          compact ? 'h-7 w-7' : 'h-8 w-8'
        }`}
      >
        <Minus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>
      <span
        className={`inline-flex items-center justify-center px-3 font-semibold text-[var(--text-primary)] ${
          compact ? 'min-w-[2.25rem] text-[13px]' : 'min-w-[2.6rem] text-[14px]'
        }`}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className={`flex items-center justify-center rounded-[8px] bg-[var(--gold)] text-[#140d05] transition hover:bg-[var(--gold-light)] active:scale-95 ${
          compact ? 'h-7 w-7' : 'h-8 w-8'
        }`}
      >
        <Plus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>
    </div>
  )
}
