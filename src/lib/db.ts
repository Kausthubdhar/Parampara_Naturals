import { supabase } from './supabaseClient';
import { Product, Customer, Sale, SaleItem, Category, Expense } from '../types';

// Products
export async function listProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, stock, unit, image, description, min_stock, created_at, updated_at, category_id, categories(name, icon, color)')
    .order('name');
  if (error) throw error;
  
  // Map the data to match our Product interface
  return data?.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    unit: product.unit,
    image: product.image,
    description: product.description,
    minStock: product.min_stock,
    createdAt: product.created_at ? new Date(product.created_at) : undefined,
    updatedAt: product.updated_at ? new Date(product.updated_at) : undefined,
    category: product.categories?.[0]?.name || 'Uncategorized',
  })) || [];
}

export async function createProduct(input: Partial<Product> & { name: string; price: number; unit: string }) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      price: input.price,
      unit: input.unit,
      stock: input.stock ?? 0,
      image: input.image ?? null,
      description: input.description ?? null,
      min_stock: input.minStock ?? null,
      category_id: (input as any).categoryId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: updates.name,
      price: updates.price,
      unit: updates.unit as any,
      stock: updates.stock,
      image: updates.image ?? null,
      description: updates.description ?? null,
      min_stock: updates.minStock ?? null,
      category_id: (updates as any).categoryId ?? null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// Customers
export async function listCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function upsertCustomer(input: Partial<Customer> & { name: string; phone: string }) {
  const { data, error } = await supabase
    .from('customers')
    .upsert({
      id: input.id,
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      address: input.address ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Sales
type NewSaleInput = {
  customerId?: string | null;
  paymentMethod: 'cash' | 'card' | 'upi';
  items: Array<Pick<SaleItem, 'productId' | 'productName' | 'price' | 'quantity' | 'total'>>;
  tax?: number;
  discount?: number;
};

export async function createSale(input: NewSaleInput) {
  const total = input.items.reduce((sum, i) => sum + (i.total ?? i.price * i.quantity), 0);
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      customer_id: input.customerId ?? null,
      total,
      payment_method: input.paymentMethod,
      status: 'completed',
      tax: input.tax ?? 0,
      discount: input.discount ?? 0,
    })
    .select()
    .single();
  if (saleError) throw saleError;

  const itemsPayload = input.items.map((i) => ({
    sale_id: sale.id,
    product_id: i.productId,
    product_name: i.productName,
    price: i.price,
    quantity: i.quantity,
    total: i.total ?? i.price * i.quantity,
  }));

  const { error: itemsError } = await supabase.from('sale_items').insert(itemsPayload);
  if (itemsError) throw itemsError;

  return sale;
}

export async function listSales() {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      id,
      date,
      total,
      payment_method,
      status,
      tax,
      discount,
      customer_id,
      customers(id, name, phone, email, address, total_purchases, loyalty_points, last_purchase)
    `)
    .order('date', { ascending: false });
  if (error) throw error;
  
  // Map the data to match our Sale interface
  return data?.map(sale => ({
    id: sale.id,
    date: new Date(sale.date),
    total: sale.total,
    paymentMethod: sale.payment_method,
    status: sale.status,
    tax: sale.tax,
    discount: sale.discount,
    customer: sale.customers?.[0] ? {
      id: sale.customers[0].id,
      name: sale.customers[0].name,
      phone: sale.customers[0].phone,
      email: sale.customers[0].email,
      address: sale.customers[0].address,
      totalPurchases: sale.customers[0].total_purchases,
      loyaltyPoints: sale.customers[0].loyalty_points,
      lastPurchase: sale.customers[0].last_purchase ? new Date(sale.customers[0].last_purchase) : undefined,
    } : undefined,
    items: [], // We'll need to fetch items separately if needed
  })) || [];
}

// Expenses
export async function listExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createExpense(input: Omit<Expense, 'id'>) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      date: input.date,
      category: input.category,
      amount: input.amount,
      description: input.description,
      receipt: input.receipt ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}


