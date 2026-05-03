export const VAT_RATE = 0.16;

export const calculatePriceWithVAT = (basePrice: number) => {
  const vatAmount = Math.round(basePrice * VAT_RATE);
  const totalPrice = basePrice + vatAmount;

  return {
    basePrice,
    vatAmount,
    totalPrice,
  };
};

export const formatKES = (amount: number) => {
  return `KES ${amount.toLocaleString('en-KE')}`;
};