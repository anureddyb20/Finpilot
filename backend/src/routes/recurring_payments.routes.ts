import { Router } from 'express';
import { getRecurringPayments, createRecurringPayment, updateRecurringPayment, deleteRecurringPayment } from '../controllers/recurring_payments.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/', getRecurringPayments);
router.post('/', createRecurringPayment);
router.put('/:id', updateRecurringPayment);
router.delete('/:id', deleteRecurringPayment);

export default router;
