import React, { useState } from 'react';
import { EventProvider, useEventContext } from './context/EventContext';
import { Navbar, AppView } from './components/Navbar';
import { Footer } from './components/Footer';
import { CardPackRevealModal } from './components/CardPackRevealModal';
import { ThaiGhost3DAtmosphere } from './components/ThaiGhost3DAtmosphere';

// Views
import { HomeView } from './views/HomeView';
import { RegisterView } from './views/RegisterView';
import { ShirtView } from './views/ShirtView';
import { MyCardView } from './views/MyCardView';
import { HorrorStoriesView } from './views/HorrorStoriesView';
import { DirectoryView } from './views/DirectoryView';
import { FaqContactView } from './views/FaqContactView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { GhostCollectionView } from './views/GhostCollectionView';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const { justRevealedCard, setJustRevealedCard } = useEventContext();

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0817] text-slate-100 font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Background Ambient Glows & Supernatural Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[150px]" />
        {/* Subtle graveyard fog vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_0%,rgba(11,8,23,0.85)_100%)]" />
      </div>

      {/* Thai Ghost 3D Atmosphere Canvas with Floating Phantoms & Ghostly Lantern */}
      <ThaiGhost3DAtmosphere />

      {/* Navigation Bar */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content View Container */}
      <main className="flex-1 z-10 py-4 sm:py-6">
        {currentView === 'home' && <HomeView onNavigate={handleNavigate} />}
        {currentView === 'collection' && <GhostCollectionView onNavigate={handleNavigate} />}
        {currentView === 'register' && <RegisterView onNavigate={handleNavigate} />}
        {currentView === 'shirt' && <ShirtView onNavigate={handleNavigate} />}
        {currentView === 'mycard' && <MyCardView onNavigate={handleNavigate} />}
        {currentView === 'horror' && <HorrorStoriesView onNavigate={handleNavigate} />}
        {currentView === 'directory' && <DirectoryView onNavigate={handleNavigate} />}
        {currentView === 'faq' && <FaqContactView initialTab="faq" />}
        {currentView === 'contact' && <FaqContactView initialTab="contact" />}
        {currentView === 'admin' && <AdminDashboardView onNavigate={handleNavigate} />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Gacha Card Pack Reveal Modal (Triggered on Registration / Quiz Reveal) */}
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
