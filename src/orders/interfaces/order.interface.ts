export interface Order {
  id: number;
  clientName: string;
  items: OrderItem[];
  totalValue: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PRODUCTION = 'IN_PRODUCTION',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED'
} 