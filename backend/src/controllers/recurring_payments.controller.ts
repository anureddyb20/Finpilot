import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRecurringPayments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const payments = await prisma.recurringPayment.findMany({ where: { userId } });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch payments' } });
  }
};

export const createRecurringPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const payment = await prisma.recurringPayment.create({
      data: { ...req.body, userId },
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create payment' } });
  }
};

export const updateRecurringPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const payment = await prisma.recurringPayment.updateMany({
      where: { id, userId },
      data: req.body,
    });
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update payment' } });
  }
};

export const deleteRecurringPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    await prisma.recurringPayment.deleteMany({ where: { id, userId } });
    res.status(200).json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete payment' } });
  }
};
