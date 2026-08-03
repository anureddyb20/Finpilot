import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer', 'refund']),
  category: z.string(),
  amount: z.number().positive(),
  date: z.string().datetime(),
  time: z.string().datetime(),
  merchant: z.string(),
  method: z.string(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
});

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 50, type, category } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const whereClause: any = { userId, deletedAt: null };
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.transaction.count({ where: whereClause })
    ]);

    res.status(200).json({ transactions, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch transactions' } });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const data = transactionSchema.parse(req.body);

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId,
      },
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: { message: 'Validation error', details: error.errors } });
    }
    res.status(500).json({ error: { message: 'Failed to create transaction' } });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const data = transactionSchema.partial().parse(req.body);

    const transaction = await prisma.transaction.updateMany({
      where: { id, userId },
      data,
    });

    if (transaction.count === 0) {
      return res.status(404).json({ error: { message: 'Transaction not found' } });
    }

    res.status(200).json({ message: 'Transaction updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: { message: 'Failed to update transaction' } });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    // Soft delete
    const transaction = await prisma.transaction.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });

    if (transaction.count === 0) {
      return res.status(404).json({ error: { message: 'Transaction not found' } });
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete transaction' } });
  }
};
