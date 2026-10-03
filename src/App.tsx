import React, { useState } from 'react';
import { EventProvider, useEventContext } from './context/EventContext';
import { Navbar, AppView } from './components/Navbar';
import { Footer } from './components/Footer';
import { CardPackRevealModal } from './components/CardPackRevealModal';

// Views
import { HomeView } from './views/HomeView';
import { RegisterView } from './views/RegisterView';
import { ShirtView } from './views/ShirtView';
import { MyCardView } from './views/MyCardView';
import { DirectoryView } from './views/DirectoryView';
import { FaqContactView } from './views/FaqContactView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { GhostCollectionView } from './views/GhostCollectionView';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [registrationPreselectedType, setRegistrationPreselectedType] = useState<
    'RUN_FREE' | 'RUN_AND_SHIRT' | 'SHIRT_ONLY'
  >('RUN_FREE');
  const { justRevealedCard, setJustRevealedCard } = useEventContext();

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRegistrationType = (type: 'RUN_FREE' | 'RUN_AND_SHIRT' | 'SHIRT_ONLY') => {
    setRegistrationPreselectedType(type);
    setCurrentView('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-red-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content View Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSelectRegistrationType={handleSelectRegistrationType}
          />
        )}
        {currentView === 'collection' && <GhostCollectionView onNavigate={handleNavigate} />}
        {currentView === 'register' && (
          <RegisterView
            onNavigate={handleNavigate}
            initialPackage={registrationPreselectedType}
          />
        )}
        {currentView === 'shirt' && <ShirtView onNavigate={handleNavigate} />}
        {currentView === 'mycard' && <MyCardView onNavigate={handleNavigate} />}
        {currentView === 'directory' && <DirectoryView onNavigate={handleNavigate} />}
        {currentView === 'contact' && <FaqContactView />}
        {currentView === 'admin' && <AdminDashboardView onNavigate={handleNavigate} />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Gacha Card Pack Reveal Modal */}
      <CardPackRevealModal
        isOpen={!!justRevealedCard}
        card={justRevealedCard}
        onClose={() => {
          setJustRevealedCard(null);
          handleNavigate('mycard');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <EventProvider>
      <AppContent />
    </EventProvider>
  );
}
