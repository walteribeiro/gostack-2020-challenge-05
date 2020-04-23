import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const checkTransactionExists = await transactionsRepository.findOne(id);

    if (!checkTransactionExists) {
      throw new AppError('Transaction does not exists');
    }

    await transactionsRepository.remove(checkTransactionExists);
  }
}

export default DeleteTransactionService;
