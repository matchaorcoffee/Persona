import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Globe, User, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Character } from '../types';
import { CharacterCard } from '../components/Characters/CharacterCard';

type Tab = 'all' | 'gallery' | 'mine';

export function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [galleryChars, setGalleryChars] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('all');

  useEffect(() => {
    async function load() {
      try {
        const [charRes, galleryRes] = await Promise.all([
          api.get('/characters'),
          api.get('/characters/gallery'),
        ]);
        setCharacters(charRes.data.characters);
        setGalleryChars(galleryRes.data.characters);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const systemChars = characters.filter((c) => c.isSystemCharacter);
  const myChars = characters.filter((c) => !c.isSystemCharacter);

  const tabItems: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: 'Characters', icon: <Sparkles className="w-4 h-4" />, count: systemChars.length },
    { id: 'gallery', label: 'Gallery', icon: <Globe className="w-4 h-4" />, count: galleryChars.length },
    { id: 'mine', label: 'My Creations', icon: <User className="w-4 h-4" />, count: myChars.length },
  ];

  const displayed =
    activeTab === 'all' ? systemChars :
    activeTab === 'gallery' ? galleryChars :
    myChars;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Characters</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Choose a character to start a conversation</p>
        </div>
        <Link
          to="/create-character"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted rounded-xl p-1 w-fit">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className="text-xs bg-muted-foreground/20 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          {activeTab === 'mine' ? (
            <div>
              <p className="mb-3">You haven't created any characters yet.</p>
              <Link to="/create-character" className="text-primary hover:underline">
                Create your first character →
              </Link>
            </div>
          ) : (
            <p>No characters found.</p>
          )}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence>
            {displayed.map((char, i) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
              >
                <CharacterCard character={char} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
