import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { TrendingDecks } from '../components/home/TrendingDecks';
import { BrewCTA } from '../components/home/BrewCTA';
import { LoginModal } from '../components/auth/LoginModal';
import { SignupModal } from '../components/auth/SignupModal';

type Modal = 'login' | 'signup' | null;

export function HomePage() {
  const [modal, setModal] = useState<Modal>(null);
  const navigate = useNavigate();

  const handleImported = () => {
    navigate('/builder');
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen">
      <Navbar
        onLogin={() => setModal('login')}
        onSignup={() => setModal('signup')}
      />

      <main>
        <HeroSection onSignup={() => setModal('signup')} />
        <FeaturesSection />
        <TrendingDecks onImport={handleImported} />
        <BrewCTA onSignup={() => setModal('signup')} />
      </main>

      <Footer />

      {modal === 'login' && (
        <LoginModal
          onClose={() => setModal(null)}
          onSwitchToSignup={() => setModal('signup')}
        />
      )}
      {modal === 'signup' && (
        <SignupModal
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal('login')}
        />
      )}
    </div>
  );
}
