import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { DeckProvider } from './context/DeckContext';
import { ChatLimitProvider } from './context/ChatLimitContext';
import { HomePage } from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { ProfilePage } from './pages/ProfilePage';
import { DeckDetailPage } from './pages/DeckDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <DeckProvider>
        <ChatLimitProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/builder" element={<BuilderPage />} />
              <Route path="/builder/:deckId" element={<BuilderPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/decks/:deckId" element={<DeckDetailPage />} />
            </Routes>
          </BrowserRouter>
        </ChatLimitProvider>
      </DeckProvider>
    </AuthProvider>
  );
}
