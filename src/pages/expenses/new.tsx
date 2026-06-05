import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Alert } from '@/components/Alert';
import { useFinanceStore } from '@/store/finance';
import { useRouter } from 'next/router';

export default function AddExpensePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const addExpense = useFinanceStore((state) => state.addExpense);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('OFFICE_EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'GADI_PETROL', label: 'Gadi/Petrol' },
    { value: 'KHANA_FOOD', label: 'Khana/Food' },
    { value: 'ADS', label: 'Ads' },
    { value: 'INTERNET', label: 'Internet' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'OFFICE_EXPENSE', label: 'Office Expense' },
    { value: 'OTHER_BILLS', label: 'Other Bills' },
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!description) {
      setErrors((prev) => ({ ...prev, description: 'Description is required' }));
    }
    if (!amount || isNaN(parseFloat(amount))) {
      setErrors((prev) => ({ ...prev, amount: 'Valid amount is required' }));
    }

    if (description && amount && !isNaN(parseFloat(amount))) {
      setIsLoading(true);

      try {
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description,
            amount: parseFloat(amount),
            category,
            date: new Date(date).toISOString(),
          }),
        });

        if (!response.ok) throw new Error('Failed to save expense');

        const expense = await response.json();
        addExpense(expense);

        setShowSuccess(true);
        setDescription('');
        setAmount('');
        setCategory('OFFICE_EXPENSE');
        setDate(new Date().toISOString().split('T')[0]);
        setIsLoading(false);

        setTimeout(() => {
          router.push('/expenses');
        }, 1500);
      } catch (error) {
        console.error('Error saving expense:', error);
        setErrors({ form: 'Failed to save expense. Please try again.' });
        setIsLoading(false);
      }
    }
  };

  return (
    <Layout
      sidebar={
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      }
      header={
        <Header
          title="Add Expense"
          showMenu
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      }
    >
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        {showSuccess && (
          <Alert
            type="success"
            title="Expense Added!"
            message="Your expense has been recorded successfully. Redirecting..."
            closable={false}
          />
        )}

        <div className="card p-6 md:p-8 mt-6">
          <h2 className="text-2xl font-bold text-apple-text mb-2">
            Log New Expense
          </h2>
          <p className="text-apple-text-secondary mb-6">
            Keep track of all business expenses to calculate actual profit.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Description"
              placeholder="e.g., Office supplies, Travel"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field w-full"
                  step="0.01"
                />
                {errors.amount && (
                  <p className="text-apple-red text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field w-full"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input-field w-full"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="flex-1"
              >
                Save Expense
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.push('/expenses')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
