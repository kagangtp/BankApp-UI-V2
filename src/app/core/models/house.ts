import { FileItem } from './file-item';

export interface House {
    id: number;
    address: string;
    description?: string;
    customerId: number;
    images: FileItem[];
}
