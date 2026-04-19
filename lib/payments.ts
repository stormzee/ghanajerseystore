export const PAYMENT_METHODS = {
  CASH: 'cash',
  MOMO: 'momo',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_VALUES: PaymentMethod[] = [PAYMENT_METHODS.CASH, PAYMENT_METHODS.MOMO];
