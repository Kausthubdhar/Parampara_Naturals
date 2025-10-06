import { useNotifications } from '../contexts/NotificationContext';
import { Product, Sale, Customer } from '../types';

// Notification service for business events
export class NotificationService {
  private static instance: NotificationService;
  private addNotification: (notification: any) => void;

  constructor(addNotification: (notification: any) => void) {
    this.addNotification = addNotification;
  }

  static getInstance(addNotification: (notification: any) => void): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(addNotification);
    }
    return NotificationService.instance;
  }

  // Low stock notifications
  checkLowStock(products: Product[]) {
    const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 5));
    
    lowStockProducts.forEach(product => {
      this.addNotification({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${product.name} is running low (${product.stock} ${product.unit} remaining)`,
        actionUrl: '/products',
        actionText: 'View Products',
        icon: '⚠️'
      });
    });
  }

  // New sale notifications
  notifyNewSale(sale: Sale) {
    this.addNotification({
      type: 'success',
      title: 'New Sale Completed',
      message: `Sale #${sale.receiptId || sale.id} for ₹${sale.total.toLocaleString()} has been completed`,
      actionUrl: '/sales',
      actionText: 'View Sales',
      icon: '💰'
    });
  }

  // New customer notifications
  notifyNewCustomer(customer: Customer) {
    this.addNotification({
      type: 'info',
      title: 'New Customer Added',
      message: `${customer.name} has been added to your customer list`,
      actionUrl: '/customers',
      actionText: 'View Customers',
      icon: '👤'
    });
  }

  // Payment reminder notifications
  notifyPaymentReminder(sale: Sale) {
    if (sale.status === 'pending' && sale.remainingAmount && sale.remainingAmount > 0) {
      this.addNotification({
        type: 'warning',
        title: 'Payment Reminder',
        message: `Sale #${sale.receiptId || sale.id} has ₹${sale.remainingAmount.toLocaleString()} pending payment`,
        actionUrl: '/sales',
        actionText: 'View Sale',
        icon: '💳'
      });
    }
  }

  // Achievement notifications
  notifyAchievement(achievement: string, description: string) {
    this.addNotification({
      type: 'achievement',
      title: achievement,
      message: description,
      icon: '🏆'
    });
  }

  // Daily sales milestone
  checkDailySalesMilestone(dailySales: number) {
    const milestones = [1000, 5000, 10000, 25000, 50000];
    const reachedMilestone = milestones.find(milestone => 
      dailySales >= milestone && dailySales < milestone + 1000
    );

    if (reachedMilestone) {
      this.notifyAchievement(
        'Daily Sales Milestone! 🎉',
        `Congratulations! You've reached ₹${reachedMilestone.toLocaleString()} in daily sales!`
      );
    }
  }


  // System notifications
  notifySystemUpdate(message: string) {
    this.addNotification({
      type: 'info',
      title: 'System Update',
      message: message,
      icon: '🔧'
    });
  }

  // Welcome notification for new users
  notifyWelcome(userName: string, storeName: string) {
    this.addNotification({
      type: 'success',
      title: 'Welcome to Organica AI! 🎉',
      message: `Hi ${userName}! Your ${storeName} is ready to go. Start by adding your first product.`,
      actionUrl: '/products',
      actionText: 'Add Product',
      icon: '🚀'
    });
  }
}

// Hook to use notification service
export const useNotificationService = () => {
  const { addNotification } = useNotifications();
  return NotificationService.getInstance(addNotification);
};
