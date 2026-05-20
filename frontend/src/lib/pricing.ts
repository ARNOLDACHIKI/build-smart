export const VAT_RATE = 0.16;
export const EXCHANGE_RATE = 130; // 1 USD = 130 KES

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

export const formatUSD = (amount: number | null | undefined = 0) => {
  const safeAmount = Number.isFinite(amount) ? Number(amount) : 0;
  return `$${safeAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const convertKEStoUSD = (kesAmount: number) => {
  return Math.round(kesAmount / EXCHANGE_RATE);
};

export const convertUSDtoKES = (usdAmount: number) => {
  return Math.round(usdAmount * EXCHANGE_RATE);
};

export const formatCurrency = (amount: number, currency: 'USD' | 'KES') => {
  return currency === 'USD' ? formatUSD(amount) : formatKES(amount);
};