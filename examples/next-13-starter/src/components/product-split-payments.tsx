import { type Dinero, allocate, toUnit, up } from 'dinero.js';
import { getCurrencySymbol } from '~/app/utils/currency-symbol';

export const ProductSplitPayments = ({ price }: { price: Dinero<number> }) => {
  // only offer split payments for more expensive items
  if (toUnit(price) < 150) {
    return null;
  }

  const [perMonth] = allocate(price, [1, 2]);
  return (
    <div className="text-sm text-gray-400">
      Or {getCurrencySymbol(price)}
      {toUnit(perMonth, { digits: 0, round: up })}/month for 3 months
    </div>
  );
};
