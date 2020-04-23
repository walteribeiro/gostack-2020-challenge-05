import fs from 'fs';
import csvParse from 'csv-parse';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  path: string;
}

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ path }: Request): Promise<Transaction[]> {
    const readCSVStream = fs.createReadStream(path);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: TransactionDTO[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      lines.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const createTransaction = new CreateTransactionService();

    const transactions = await Promise.all(
      lines.map(item => {
        return createTransaction.execute({
          title: item.title,
          value: item.value,
          type: item.type,
          category: item.category,
        });
      }),
    );

    return transactions;
  }
}

export default ImportTransactionsService;
