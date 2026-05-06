import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MpesaCheckoutDialog from '@/components/landing/MpesaCheckoutDialog';

const toastSuccess = vi.fn();
const toastError = vi.fn();
const toastInfo = vi.fn();
const mockFetch = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
    info: (...args: unknown[]) => toastInfo(...args),
  },
}));

vi.mock('@/lib/api', () => ({
  apiUrl: (path: string) => path,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

describe('Mpesa checkout dialog', () => {
  it('submits an STK push request with the user context', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'M-Pesa STK push sent.',
        mpesa: { CheckoutRequestID: 'ws_CO_12345' },
      }),
    });

    render(
      <MpesaCheckoutDialog
        open
        onOpenChange={vi.fn()}
        plan={{ key: 'basic', name: 'Basic', description: 'For growing teams' }}
        billingCycle="annual"
        amount={48720}
        priceLabel="KES 48,720 (incl. VAT)"
        userId="user-1"
        defaultPayerName="Jane Doe"
        defaultPayerEmail="jane@example.com"
      />
    );

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('M-Pesa phone number'), { target: { value: '0712345678' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send STK Push' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/payments/mpesa/stk-push',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            planKey: 'basic',
            billingCycle: 'annual',
            phoneNumber: '0712345678',
            payerName: 'Jane Doe',
            payerEmail: 'jane@example.com',
            userId: 'user-1',
          }),
        })
      );
    });

    expect(toastSuccess).toHaveBeenCalled();
    expect(toastInfo).toHaveBeenCalled();
  });
});
