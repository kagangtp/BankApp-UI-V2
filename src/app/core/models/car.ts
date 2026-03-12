import { FileItem } from './file-item';

export interface Car {
    id: number;
    plate: string;
    description?: string;
    customerId: number;
    images: FileItem[];
}
