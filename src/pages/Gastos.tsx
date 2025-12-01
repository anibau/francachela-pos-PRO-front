import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt } from 'lucide-react';
import { expensesAPI } from '@/services/api'; // TODO: Migrar a hooks
import type { Expense } from '@/types';

export default function Gastos() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const data = await expensesAPI.getAll();
    setExpenses(data);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gastos</h1>
        <p className="text-muted-foreground">Control de gastos del negocio</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-destructive">S/ {totalExpenses.toFixed(2)}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">{expense.description}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(expense.date).toLocaleString('es-PE')}
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-destructive">S/ {expense.amount.toFixed(2)}</span>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge>{expense.category}</Badge>
                <Badge variant="outline">{expense.paymentMethod}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
