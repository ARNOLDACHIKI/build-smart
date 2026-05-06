export const VAT_RATE = 0.16;

export const calculatePriceWithVAT = (basePrice: number | null | undefined = 0) => {
  const safeBasePrice = Number.isFinite(basePrice) ? Number(basePrice) : 0;
  const vatAmount = Math.round(safeBasePrice * VAT_RATE);
  const totalPrice = safeBasePrice + vatAmount;

  return {
    basePrice: safeBasePrice,
    vatAmount,
    totalPrice,
  };
};

export const formatKES = (amount: number | null | undefined = 0) => {
  const safeAmount = Number.isFinite(amount) ? Number(amount) : 0;
  return `KES ${safeAmount.toLocaleString('en-KE')}`;
};