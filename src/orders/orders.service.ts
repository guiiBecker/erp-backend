import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './interfaces/order.interface';

@Injectable()
export class OrdersService {
  // Aqui seria usado o Prisma para acessar o banco de dados
  private orders: Order[] = [];

  create(createOrderDto: CreateOrderDto) {
    // Calcula o valor total
    const totalValue = createOrderDto.items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );

    const newOrder: Order = {
      id: Date.now(),
      ...createOrderDto,
      totalValue,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
    };
    
    this.orders.push(newOrder);
    return newOrder;
  }

  findAll() {
    return this.orders;
  }

  findOne(id: number) {
    const order = this.orders.find(order => order.id === id);
    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }
    return order;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }
    
    // Recalcula o valor total se os itens foram atualizados
    let totalValue = this.orders[orderIndex].totalValue;
    if (updateOrderDto.items) {
      totalValue = updateOrderDto.items.reduce(
        (total, item) => total + item.quantity * item.unitPrice,
        0
      );
    }
    
    const updatedOrder = {
      ...this.orders[orderIndex],
      ...updateOrderDto,
      totalValue,
      updatedAt: new Date(),
    };
    
    this.orders[orderIndex] = updatedOrder;
    return updatedOrder;
  }

  remove(id: number) {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }
    
    this.orders.splice(orderIndex, 1);
    
    return { message: `Pedido com ID ${id} removido com sucesso` };
  }
}
