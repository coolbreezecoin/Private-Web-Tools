export type LoanError = "invalid";

export interface LoanResult {
  monthlyPayment: number | null;
  totalPayment: number | null;
  totalInterest: number | null;
  error: LoanError | null;
}

function validPrincipal(value: number) {
  return Number.isFinite(value) && value > 0;
}

function validRate(value: number) {
  return Number.isFinite(value) && value >= 0;
}

function validMonths(value: number) {
  return Number.isFinite(value) && value > 0;
}

export function monthlyPayment(principal: number, annualRatePct: number, months: number): LoanResult {
  if (!validPrincipal(principal) || !validRate(annualRatePct) || !validMonths(months)) {
    return { monthlyPayment: null, totalPayment: null, totalInterest: null, error: "invalid" };
  }

  const termMonths = Math.round(months);
  const monthlyRate = annualRatePct / 100 / 12;
  const payment =
    monthlyRate === 0
      ? principal / termMonths
      : (principal * monthlyRate * (1 + monthlyRate) ** termMonths) / ((1 + monthlyRate) ** termMonths - 1);

  if (!Number.isFinite(payment)) {
    return { monthlyPayment: null, totalPayment: null, totalInterest: null, error: "invalid" };
  }

  const totalPayment = payment * termMonths;

  return {
    monthlyPayment: payment,
    totalPayment,
    totalInterest: totalPayment - principal,
    error: null,
  };
}
