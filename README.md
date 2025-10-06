# 🤖 Organica AI - Intelligent Store Management Application

A comprehensive, AI-powered store management application designed specifically for organic stores. Built with React, TypeScript, and Tailwind CSS, featuring intelligent automation, dark/light theme support, and comprehensive business management capabilities.

## ✨ Features

### 🏠 AI-Powered Dashboard
- **Intelligent Sales Overview**: Daily, weekly, monthly revenue charts with AI insights
- **Smart Metrics**: Total sales, orders count, top products, customer count with predictions
- **AI Recommendations**: Latest orders, low stock alerts, and intelligent suggestions
- **Quick Actions**: New sale, add product, view customers buttons
- **Advanced Analytics**: Sales trends, order patterns, and AI-powered performance metrics

### 🛒 Sales Management
- **New Sale Screen**: 
  - Product search and selection with beautiful Unsplash images
  - Manual weight entry system with real-time price calculations
  - Shopping cart with quantity adjustments
  - Customer information capture (name, phone, email, address)
  - Multiple payment methods (cash, card, UPI)
- **Sales History**: Complete transaction log with search and filters
- **Receipt System**: Professional receipt generation and PDF export

### 📦 Product Management
- **Product Catalog**: Grid/list view with high-quality Unsplash images
- **Add/Edit Products**: Name, price per kg/unit, category, stock levels, description
- **Categories**: Organic vegetables, fruits, grains, spices, dairy, honey & jams
- **Stock Management**: Current inventory, low stock alerts, restock reminders
- **Price Management**: Bulk pricing and stock tracking

### 👥 Customer Management
- **Customer Database**: Contact details, purchase history, preferences
- **Customer Profiles**: Individual customer pages with transaction history
- **Loyalty Tracking**: Purchase frequency, total spending, favorite products
- **Contact Management**: Phone, email, address storage

### 💰 Analytics & Reports
- **Sales Reports**: Daily, weekly, monthly, yearly with exportable data
- **Product Performance**: Best sellers, slow movers, profit margins
- **Customer Analytics**: Repeat customers, average order value, demographics
- **Financial Reports**: Profit/loss statements, cash flow tracking
- **Inventory Reports**: Stock levels, turnover rates, reorder points

### 📱 Mobile-First Design
- **Bottom Navigation**: Dashboard, Sales, Products, Customers, Analytics
- **Floating Action Button**: Quick access to new sale
- **Responsive Cards**: Adapt beautifully to all screen sizes
- **Touch Gestures**: Swipe actions, pull-to-refresh
- **Offline Capability**: Local storage for critical data


## 🎨 Design System

### Color Palette
- **Primary**: #4CAF50 (natural green)
- **Background**: #F9F9F9 (light) / #1F2937 (dark)
- **Text**: #1A1A1A (light) / #F9FAFB (dark)
- **Accent Colors**: Warm earthy tones (#8D6E63, #FF9800)
- **Secondary**: #F1F8E9 (light) / #064E3B (dark)
- **Theme Support**: Full dark/light mode with smooth transitions

### Typography
- **Font**: Inter (with system font fallbacks)
- **Base font size**: 14px
- **Hierarchy**: Clear typography levels for professional appearance

### Visual Style
- Card-based layout with rounded corners (0.75rem radius)
- Subtle shadows for depth
- **Dual Theme Support**: Beautiful light and dark modes
- Minimalist and clean interface
- Touch-friendly interactions with proper spacing
- Professional AI-themed design elements

## 🚀 Technology Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Custom components with consistent design system
- **Icons**: Lucide React
- **Charts**: Recharts library for data visualization
- **Images**: Unsplash integration for product photos
- **State Management**: React hooks (useState, useEffect, useContext)
- **Authentication**: Custom auth context with localStorage persistence
- **Theme Management**: Dark/light mode with system preference detection

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx
│   ├── MobileApp.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Products.tsx
│   ├── Orders.tsx
│   ├── Customers.tsx
│   ├── Analytics.tsx
│   └── mobile/
│       ├── MobileDashboard.tsx
│       ├── NewSaleScreen.tsx
│       ├── InventoryScreen.tsx
│       ├── CustomersScreen.tsx
│       ├── AnalyticsScreen.tsx
│       └── BottomNavigation.tsx
├── data/
│   └── sampleData.ts
├── types/
│   └── index.ts
├── App.tsx
└── index.css
```

## 🏗️ Data Models

### Product
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  unit: 'kg' | 'piece' | 'liter';
  image: string;
  description?: string;
  minStock?: number;
}
```

### Customer
```typescript
interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  lastPurchase?: Date;
}
```

### Sale
```typescript
interface Sale {
  id: string;
  date: Date;
  customer?: Customer;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  status: 'completed' | 'pending' | 'cancelled';
  tax?: number;
  discount?: number;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
1. Clone the repository
```bash
git clone <repository-url>
cd organica-ai
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production
```bash
npm run build
```


## 📱 Responsive Behavior

- **Mobile-first approach**: Optimized for mobile devices
- **Tablet optimization**: Responsive layouts for medium screens
- **Desktop layouts**: Sidebar navigation for larger screens
- **Touch-friendly**: Optimized buttons and interactions
- **Image optimization**: Responsive image loading

## 🎯 Business Logic

### Sales Processing
- Support for weighted products (fruits, vegetables)
- Automatic price calculation based on weight/quantity
- Tax calculations where applicable
- Discount applications
- Multiple payment method handling

### Inventory Management
- Automatic stock deduction on sales
- Low stock alerts and notifications
- Bulk inventory updates
- Category-based organization
- Search and filter capabilities

### Reporting Features
- Daily sales summaries
- Monthly profit/loss reports
- Customer purchase patterns
- Product performance analytics
- Expense categorization and tracking

## 📊 Sample Data

The application includes realistic sample data for:
- **20+ organic products** with Unsplash images
- **10+ customer records** with realistic Indian names and contact details
- **Sample sales transactions** with various payment methods
- **Expense categories** and entries
- **Realistic pricing** for Indian organic store context

## 🔧 Customization

### Adding New Products
1. Navigate to Products section
2. Click "Add Product" button
3. Fill in product details (name, price, category, stock, unit)
4. Upload product image or use Unsplash URL
5. Set minimum stock level for alerts

### Managing Customers
1. Go to Customers section
2. Add new customer with contact details
3. Track purchase history and customer analytics
4. View customer analytics and insights

### Generating Reports
1. Access Analytics section
2. Select time range (week/month/year)
3. View various charts and metrics
4. Export data for external analysis

## 🌟 Key Benefits

- **Professional Appearance**: Clean, trustworthy interface for business use
- **Mobile-First**: Optimized for mobile devices used in stores
- **Comprehensive Features**: All essential store management capabilities
- **Indian Context**: Designed with Indian business practices in mind
- **Easy to Use**: Intuitive interface for store staff
- **Scalable**: Can grow with your business needs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ and AI intelligence for organic store owners worldwide**
