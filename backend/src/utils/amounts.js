export function rupeesToPaise(value) {
  return Math.round(Number(value) * 100);
}

export function paiseToRupees(value) {
  return Number((Number(value) / 100).toFixed(2));
}

export function calculateTotals(subtotalPaise, taxPercent) {
  const normalizedTaxPercent = Number(taxPercent);
  const taxPaise = Math.round((subtotalPaise * normalizedTaxPercent) / 100);
  const grandTotalPaise = subtotalPaise + taxPaise;

  return {
    subtotalPaise,
    taxPercent: normalizedTaxPercent,
    taxPaise,
    grandTotalPaise,
  };
}
