import { supabase } from './supabaseClient';
import { generateReceiptId } from './receiptUtils';
import { Product, Customer, SaleItem, Expense } from '../types';
import { getCurrentUserProfileId } from './supabaseAuth';

// Helper function to get current user profile ID
async function getCurrentUserContext() {
  const profileId = await getCurrentUserProfileId();
  if (!profileId) throw new Error('User not authenticated');
  
  return { userId: profileId };
}

// Categories
export async function listCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, icon, color')
    .order('name');
  if (error) throw error;
  
  return data || [];
}

export async function createDefaultCategories() {
  const defaultCategories = [
    { name: 'Vegetables', icon: '🥬', color: '#16a34a' },
    { name: 'Fruits', icon: '🍎', color: '#ef4444' },
    { name: 'Grains', icon: '🌾', color: '#f59e0b' },
    { name: 'Dairy', icon: '🥛', color: '#3b82f6' },
  ];
  
  // Check if categories already exist
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('name')
    .in('name', defaultCategories.map((cat: { name: string }) => cat.name));
  
  const existingNames = existingCategories?.map((cat: { name: string }) => cat.name) || [];
  const categoriesToCreate = defaultCategories.filter((cat: { name: string }) => !existingNames.includes(cat.name));
  
  if (categoriesToCreate.length > 0) {
    const { error } = await supabase
      .from('categories')
      .insert(categoriesToCreate);
    
    if (error) {
      console.error('Error creating default categories:', error);
      // Don't throw error, just log it
    }
  }
}

// Products
export async function listProducts() {
  const { userId } = await getCurrentUserContext();
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, 
      name, 
      price, 
      stock, 
      unit, 
      image, 
      description, 
      min_stock, 
      created_at, 
      updated_at, 
      category_id,
      categories(name, icon, color)
    `)
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  
  // Map the data to match our Product interface
  return data?.map((product: any) => ({
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
    category: product.categories?.name || 'Uncategorized',
  })) || [];
}

export async function createProduct(input: Partial<Product> & { name: string; price: number; unit: string }) {
  const { userId } = await getCurrentUserContext();
  
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
      user_id: userId,
    })
    .select(`
      id, 
      name, 
      price, 
      stock, 
      unit, 
      image, 
      description, 
      min_stock, 
      created_at, 
      updated_at, 
      category_id,
      categories(name, icon, color)
    `)
    .single();
  if (error) throw error;
  
  // Map the data to match our Product interface
  return {
    id: data.id,
    name: data.name,
    price: data.price,
    stock: data.stock,
    unit: data.unit,
    image: data.image,
    description: data.description,
    minStock: data.min_stock,
    createdAt: data.created_at ? new Date(data.created_at) : undefined,
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    category: (data.categories as any)?.name || 'Uncategorized',
  };
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { userId } = await getCurrentUserContext();
  
  // Prepare update data, only including fields that are provided in updates
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.unit !== undefined) updateData.unit = updates.unit;
  if (updates.stock !== undefined) updateData.stock = updates.stock;
  if (updates.image !== undefined) updateData.image = updates.image;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.minStock !== undefined) updateData.min_stock = updates.minStock;
  if ((updates as any).categoryId !== undefined) updateData.category_id = (updates as any).categoryId;
  
  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select(`
      id, 
      name, 
      price, 
      stock, 
      unit, 
      image, 
      description, 
      min_stock, 
      created_at, 
      updated_at, 
      category_id,
      categories(name, icon, color)
    `)
    .single();
    
  if (error) {
    console.error('Database error updating product:', error);
    throw error;
  }
  
  // Map the data to match our Product interface
  return {
    id: data.id,
    name: data.name,
    price: data.price,
    stock: data.stock,
    unit: data.unit,
    image: data.image,
    description: data.description,
    minStock: data.min_stock,
    createdAt: data.created_at ? new Date(data.created_at) : undefined,
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    category: (data.categories as any)?.name || 'Uncategorized',
  };
}

export async function deleteProduct(id: string) {
  const { userId } = await getCurrentUserContext();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

// Customers
export async function listCustomers() {
  const { userId } = await getCurrentUserContext();
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  
  // Map the data to match our Customer interface
  return data?.map((customer: any) => ({
    id: customer.id,
    firstName: customer.first_name || customer.name?.split(' ')[0] || '',
    lastName: customer.last_name || customer.name?.split(' ').slice(1).join(' ') || '',
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    ageGroup: customer.age_group,
    totalPurchases: customer.total_purchases,
    lastPurchase: customer.last_purchase ? new Date(customer.last_purchase) : undefined,
    // Backward compatibility
    name: customer.first_name && customer.last_name 
      ? `${customer.first_name} ${customer.last_name}` 
      : customer.name || '',
  })) || [];
}

export async function upsertCustomer(input: Partial<Customer> & { firstName: string; lastName?: string; phone: string }) {
  const { userId } = await getCurrentUserContext();
  
  // Check if customer with this phone number already exists for this user only
  if (!input.id) {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, first_name, last_name, name, phone')
      .eq('phone', input.phone)
      .eq('user_id', userId)
      .single();
    
    if (existingCustomer) {
      const existingName = existingCustomer.first_name && existingCustomer.last_name 
        ? `${existingCustomer.first_name} ${existingCustomer.last_name}`
        : existingCustomer.name;
      throw new Error(`You already have a customer with phone number ${input.phone} (${existingName}). Please use a different phone number or edit the existing customer.`);
    }
  }
  
  const { data, error } = await supabase
    .from('customers')
    .upsert({
      id: input.id,
      first_name: input.firstName,
      last_name: input.lastName || null,
      name: input.lastName ? `${input.firstName} ${input.lastName}` : input.firstName, // Keep name for backward compatibility
      phone: input.phone,
      email: input.email ?? null,
      address: input.address ?? null,
      age_group: input.ageGroup ?? null,
      user_id: userId,
    })
    .select()
    .single();
    
  if (error) {
    console.error('Database error creating customer:', error);
    
    // Handle specific error cases
    if (error.code === '23505') {
      // Unique constraint violation (phone + user_id combination)
      if (error.message.includes('customers_phone_user_unique')) {
        throw new Error('You already have a customer with this phone number. Please use a different phone number or edit the existing customer.');
      }
    }
    
    throw new Error(`Failed to create customer: ${error.message}`);
  }
  
  // Map the data to match our Customer interface
  return {
    id: data.id,
    firstName: data.first_name || data.name?.split(' ')[0] || '',
    lastName: data.last_name || data.name?.split(' ').slice(1).join(' ') || '',
    phone: data.phone,
    email: data.email,
    address: data.address,
    ageGroup: data.age_group,
    totalPurchases: data.total_purchases,
    lastPurchase: data.last_purchase ? new Date(data.last_purchase) : undefined,
    // Backward compatibility
    name: data.first_name && data.last_name 
      ? `${data.first_name} ${data.last_name}` 
      : data.name || '',
  };
}

// Sales
type NewSaleInput = {
  customerId?: string | null;
  paymentMethod: 'cash' | 'card' | 'upi';
  items: Array<Pick<SaleItem, 'productId' | 'productName' | 'price' | 'quantity' | 'total'>>;
  tax?: number;
  discount?: number;
  status?: 'completed' | 'pending' | 'cancelled' | 'partial';
  paidAmount?: number;
  remainingAmount?: number;
  cashReceived?: number;
  changeGiven?: number;
};

export async function createSale(input: NewSaleInput) {
  const { userId } = await getCurrentUserContext();
  const total = input.items.reduce((sum, i) => sum + (i.total ?? i.price * i.quantity), 0);
  
  
  // First, check if all products have sufficient stock
  for (const item of input.items) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('id', item.productId)
      .eq('user_id', userId)
      .single();
    
    if (productError) {
      throw new Error(`Product not found: ${item.productName}`);
    }
    
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.productName}. Available: ${product.stock}, Required: ${item.quantity}`);
    }
  }
  
  // Determine payment amounts based on status
  const status = input.status || 'completed';
  const paidAmount = input.paidAmount ?? (
    status === 'completed' ? total : 
    status === 'cancelled' ? 0 : 0
  );
  const remainingAmount = input.remainingAmount ?? (
    status === 'pending' ? total : 
    status === 'cancelled' ? 0 : 0
  );

  // Generate a unique receipt ID
  let receiptId: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    receiptId = generateReceiptId();
    // Check if this receipt ID already exists
    const { data: existingSale } = await supabase
      .from('sales')
      .select('id')
      .eq('receipt_id', receiptId)
      .eq('user_id', userId)
      .single();
    
    isUnique = !existingSale;
    attempts++;
  } while (!isUnique && attempts < maxAttempts);
  
  if (!isUnique) {
    throw new Error('Unable to generate unique receipt ID after multiple attempts');
  }

  // Create the sale
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      customer_id: input.customerId ?? null,
      total,
      payment_method: input.paymentMethod,
      status,
      tax: input.tax ?? 0,
      discount: input.discount ?? 0,
      paid_amount: paidAmount,
      remaining_amount: remainingAmount,
      cash_received: input.cashReceived ?? null,
      change_given: input.changeGiven ?? null,
      receipt_id: receiptId,
      user_id: userId,
    })
    .select()
    .single();
  if (saleError) throw saleError;

  // Create sale items
  const itemsPayload = input.items.map((i) => ({
    sale_id: sale.id,
    product_id: i.productId,
    product_name: i.productName,
    price: i.price,
    quantity: i.quantity,
    total: i.total ?? i.price * i.quantity,
    user_id: userId,
  }));

  const { error: itemsError } = await supabase.from('sale_items').insert(itemsPayload);
  if (itemsError) throw itemsError;

  // Update product stock for each item
  for (const item of input.items) {
    // First get the current stock
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.productId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      console.error(`Error fetching current stock for product ${item.productId}:`, fetchError);
      continue;
    }
    
    // Calculate new stock
    const newStock = currentProduct.stock - item.quantity;
    
    // Update the stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.productId)
      .eq('user_id', userId);
    
    if (updateError) {
      console.error(`Error updating stock for product ${item.productId}:`, updateError);
      // Don't throw error here to avoid partial rollback issues
      // The sale is already created, so we'll just log the error
    }
  }

  return sale;
}

export async function listSales() {
  const { userId } = await getCurrentUserContext();
  
  const { data, error } = await supabase
    .from('sales')
    .select(`
      id,
      receipt_id,
      date,
      total,
      payment_method,
      status,
      tax,
      discount,
      paid_amount,
      remaining_amount,
      cash_received,
      change_given,
      customer_id,
      customers!left(id, first_name, last_name, name, phone, email, address, total_purchases, last_purchase),
      sale_items!left(id, product_id, product_name, price, quantity, total)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  

  // Map the data to match our Sale interface
  return data?.map((sale: any) => ({
    id: sale.id,
    receiptId: sale.receipt_id,
    date: new Date(sale.date),
    total: sale.total,
    paymentMethod: sale.payment_method,
    status: sale.status,
    tax: sale.tax,
    discount: sale.discount,
    paidAmount: sale.paid_amount,
    remainingAmount: sale.remaining_amount,
    cashReceived: sale.cash_received,
    changeGiven: sale.change_given,
    customer: sale.customers ? {
      id: sale.customers.id,
      firstName: sale.customers.first_name || sale.customers.name?.split(' ')[0] || '',
      lastName: sale.customers.last_name || sale.customers.name?.split(' ').slice(1).join(' ') || '',
      phone: sale.customers.phone,
      email: sale.customers.email,
      address: sale.customers.address,
      totalPurchases: sale.customers.total_purchases,
      lastPurchase: sale.customers.last_purchase ? new Date(sale.customers.last_purchase) : undefined,
      // Backward compatibility
      name: sale.customers.first_name && sale.customers.last_name 
        ? `${sale.customers.first_name} ${sale.customers.last_name}` 
        : sale.customers.name || '',
    } : undefined,
    items: sale.sale_items?.map((item: any) => ({
      productId: item.product_id,
      productName: item.product_name,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
    })) || [],
  })) || [];
}

// Expenses
export async function listExpenses() {
  const { userId } = await getCurrentUserContext();
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createExpense(input: Omit<Expense, 'id'>) {
  const { userId } = await getCurrentUserContext();
  
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      date: input.date,
      category: input.category,
      amount: input.amount,
      description: input.description,
      receipt: input.receipt ?? null,
      user_id: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Update sale payment status
export async function updateSalePaymentStatus(
  saleId: string,
  paidAmount: number,
  remainingAmount: number,
  status: 'completed' | 'pending' | 'cancelled' | 'partial'
) {
  const { error } = await supabase
    .rpc('update_sale_payment_status', {
      p_sale_id: saleId,
      p_paid_amount: paidAmount,
      p_remaining_amount: remainingAmount,
      p_status: status
    });
  
  if (error) throw error;
}