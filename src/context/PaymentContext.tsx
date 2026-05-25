import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PaymentRecord {
  id: string;
  type: 'Tax' | 'Lease' | 'ServiceFee';
  title: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  reference: string;
  method: 'TeleBirr' | 'CBE Birr' | 'Bank Transfer';
}

interface PaymentContextType {
  balance: number;
  history: PaymentRecord[];
  pendingPayments: PaymentRecord[];
  addPayment: (payment: Omit<PaymentRecord, 'id'>) => void;
  payInvoice: (id: string) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<PaymentRecord[]>([
    {
      id: '1',
      type: 'Tax',
      title: 'Annual Land Tax 2023',
      amount: 1250.75,
      date: '2023-12-15',
      status: 'Completed',
      reference: 'TX-BN-2023-9912',
      method: 'TeleBirr'
    },
    {
      id: '2',
      type: 'ServiceFee',
      title: 'Mutation Request Fee',
      amount: 450.00,
      date: '2024-01-20',
      status: 'Completed',
      reference: 'SF-BDU-2024-001',
      method: 'CBE Birr'
    }
  ]);

  const [pendingPayments, setPendingPayments] = useState<PaymentRecord[]>([
    {
      id: '3',
      type: 'Lease',
      title: 'Quarterly Lease Payment (Q1 2024)',
      amount: 4500.00,
      date: '2024-04-30',
      status: 'Pending',
      reference: 'LS-Q1-2024-01',
      method: 'TeleBirr'
    }
  ]);

  const addPayment = (payment: Omit<PaymentRecord, 'id'>) => {
    const newRecord = { ...payment, id: Math.random().toString(36).substr(2, 9) };
    setHistory([newRecord, ...history]);
  };

  const payInvoice = (id: string) => {
    const invoice = pendingPayments.find(p => p.id === id);
    if (invoice) {
        setPendingPayments(pendingPayments.filter(p => p.id !== id));
        setHistory([{ ...invoice, status: 'Completed', date: new Date().toISOString().split('T')[0] }, ...history]);
    }
  };

  return (
    <PaymentContext.Provider value={{ balance: 0, history, pendingPayments, addPayment, payInvoice }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
