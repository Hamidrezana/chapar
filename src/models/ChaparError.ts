import { AnyType, SendChaparReturnType } from '../types';

class ChaparError extends Error implements SendChaparReturnType<AnyType> {
  success: boolean;
  statusCode?: number;
  data: any;
  metaData: any;
  message: string;
  constructor({ message, statusCode }: Partial<SendChaparReturnType<AnyType>>) {
    super(message);
    this.success = false;
    this.data = null;
    this.statusCode = statusCode;
    this.message = message || '';
    this.metaData = null;
  }
}

export default ChaparError;
