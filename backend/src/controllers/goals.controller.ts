import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const goals = await prisma.goal.findMany({ where: { userId } });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch goals' } });
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const goal = await prisma.goal.create({
      data: { ...req.body, userId },
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create goal' } });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const goal = await prisma.goal.updateMany({
      where: { id, userId },
      data: req.body,
    });
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update goal' } });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    await prisma.goal.deleteMany({ where: { id, userId } });
    res.status(200).json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete goal' } });
  }
};
