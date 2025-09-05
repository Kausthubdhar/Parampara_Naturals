import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import MobileApp from './components/MobileApp';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import Customers from './components/Customers';
import Analytics from './components/Analytics';
import WasteManagement from './components/WasteManagement';
import Notification from './components/Notification';
import Modal from './components/Modal';
import AddProductForm from './components/forms/AddProductForm';
import NewSaleForm from './components/forms/NewSaleForm';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'sales' | 'products' | 'customers' | 'analytics' | 'waste-management'>('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add-product' | 'new-sale'>('new-sale');

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openModal = (type: 'add-product' | 'new-sale') => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'add-product':
        return <AddProductForm onClose={closeModal} />;
      case 'new-sale':
        return <NewSaleForm onClose={closeModal} />;
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'add-product':
        return 'Add New Product';
      case 'new-sale':
        return 'New Sale';
      default:
        return '';
    }
  };

  if (isMobile) {
    return (
      <ThemeProvider>
        <AppProvider>
          <MobileApp 
            currentView={currentView} 
            setCurrentView={setCurrentView}
            onNewSale={() => openModal('new-sale')}
            onAddProduct={() => openModal('add-product')}
          />
          <Notification />
          <Modal
            isOpen={showModal}
            onClose={closeModal}
            title={getModalTitle()}
            size={modalType === 'new-sale' ? 'xl' : 'lg'}
          >
            {renderModalContent()}
          </Modal>
        </AppProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppProvider>
        <div className="min-h-screen bg-background dark:bg-background-dark transition-colors duration-200">
          <Header onNewSale={() => openModal('new-sale')} />
          <div className="flex">
            <Sidebar 
              currentView={currentView} 
              setCurrentView={setCurrentView}
              onNewSale={() => openModal('new-sale')}
            />
            <main className="flex-1 p-4 sm:p-6">
              {currentView === 'dashboard' && <Dashboard />}
              {currentView === 'sales' && <Orders onNewSale={() => openModal('new-sale')} />}
              {currentView === 'products' && <Products onAddProduct={() => openModal('add-product')} />}
              {currentView === 'customers' && <Customers />}
              {currentView === 'analytics' && <Analytics />}
              {currentView === 'waste-management' && <WasteManagement />}
            </main>
          </div>
          <Notification />
          <Modal
            isOpen={showModal}
            onClose={closeModal}
            title={getModalTitle()}
            size={modalType === 'new-sale' ? 'xl' : 'lg'}
          >
            {renderModalContent()}
          </Modal>
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
