import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBudgets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const budgets = await prisma.budget.findMany({ where: { userId } });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch budgets' } });
  }
};

export const createBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const budget = await prisma.budget.create({
      data: { ...req.body, userId },
    });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create budget' } });
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const budget = await prisma.budget.updateMany({
      where: { id, userId },
      data: req.body,
    });
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update budget' } });
  }
};

export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    await prisma.budget.deleteMany({ where: { id, userId } });
    res.status(200).json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete budget' } });
  }
};
