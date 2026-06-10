import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { useFinanceStore } from '@/store/finance';
import { useRouter } from 'next/router';

export default function EditExpensePage() {
  const router = useRouter();
  const { id } = router.query;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const expenses = useFinanceStore((state) => state.expenses);
  const updateExpense = useFinanceStore((state) => state.updateExpense);

  const [date, setDate] = useState('');
  const [category, setCategory] = useState('OFFICE_EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id && expenses.length > 0) {
      const expense = expenses.find(e => e.id === id);
      if (expense) {
        setDate(new Date(expense.date).toISOString().split('T')[0]);
        setCategory(expense.category.toUpperCase());
        setDescription(expense.description);
        setAmount(String(expense.amount));
        setPaymentMethod(expense.paymentMethod || 'cash');
      }
    }
  }, [id, expenses]);

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
        const response = await fetch(`/api/expenses/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description,
            amount: parseFloat(amount),
            category,
            date: new Date(date).toISOString(),
            paymentMethod,
          }),
        });

        if (!response.ok) throw new Error('Failed to update expense');

        const updatedExpense = await response.json();
        updateExpense(String(id), updatedExpense);

        setShowSuccess(true);
        setIsLoading(false);

        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch (error) {
        console.error('Error updating expense:', error);
        setErrors({ form: 'Failed to update expense. Please try again.' });
        setIsLoading(false);
      }
    }
  };

  return (
    <Layout
      sidebar={<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      header={<Header title="Edit Expense" showMenu onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
    >
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        {showSuccess && (
          <Alert
            type="success"
            title="Expense Updated!"
            message="Your expense has been updated successfully. Redirecting..."
            closable={false}
          />
        )}
        <div className="card p-6 md:p-8 mt-6">
          <h2 className="text-2xl font-bold text-apple-text mb-2">Edit Expense</h2>
          <p className="text-apple-text-secondary mb-6">Update expense details.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">Amount (₹)</label>
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
                <label className="block text-sm font-medium text-apple-text mb-2">Date</label>
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
                <label className="block text-sm font-medium text-apple-text mb-2">Category</label>
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
                <label className="block text-sm font-medium text-apple-text mb-2">Payment Method</label>
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

            <div>
              <label className="block text-sm font-medium text-apple-text mb-2">Description</label>
              <input
                type="text"
                placeholder="e.g., Office supplies, Travel"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field w-full"
              />
              {errors.description && (
                <p className="text-apple-red text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.push('/dashboard')}
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