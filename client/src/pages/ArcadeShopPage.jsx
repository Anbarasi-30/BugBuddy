/**
 * ArcadeShopPage.jsx
 * 
 * BugBuddy Arcade Cosmetic Shop & Mascot Wardrobe.
 * Players preview skins, hats, accessories, and themes live on their mascot,
 * and purchase/equip items using earned virtual coins.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Sparkles, Check, ArrowLeft,
  Tag, Palette, Shirt, Volume2, VolumeX
} from 'lucide-react';
import BugMascot from '../components/arcade/BugMascot';
import { useArcade } from '../context/ArcadeContext';
import arcadeApi from '../services/arcadeApi';
import { playClickSound, playSuccessSound, playCoinSound } from '../utils/arcadeAudio';

const RARITY_COLORS = {
  common: '#94a3b8',
  uncommon: '#22c55e',
  rare: '#38bdf8',
  legendary: '#f59e0b',
};

export default function ArcadeShopPage() {
  const navigate = useNavigate();
  const {
    coins,
    equippedSkin,
    equippedAccessory,
    equippedTheme,
    buyItem,
    equipItem,
    soundOn,
    toggleSound,
  } = useArcade();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('skin'); // 'skin' | 'accessory' | 'theme'

  // Live Wardrobe Preview States
  const [previewSkin, setPreviewSkin] = useState(equippedSkin);
  const [previewAccessory, setPreviewAccessory] = useState(equippedAccessory);
  const [previewMood, setPreviewMood] = useState('happy');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    setPreviewSkin(equippedSkin);
    setPreviewAccessory(equippedAccessory);
  }, [equippedSkin, equippedAccessory]);

  useEffect(() => {
    arcadeApi.getShopItems()
      .then((data) => setItems(data.items || []))
      .catch((err) => console.error('[ArcadeShop] Load items error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (item) => {
    playClickSound();
    try {
      await buyItem(item.id);
      playSuccessSound();
      showMessage(`Purchased ${item.name}!`);

      // Refresh items state
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isOwned: true } : i))
      );
    } catch (err) {
      showMessage(err.response?.data?.error || err.message || 'Purchase failed.');
    }
  };

  const handleEquip = async (item) => {
    playClickSound();
    try {
      await equipItem(item.id, item.type);
      playCoinSound();
      showMessage(`Equipped ${item.name}!`);

      if (item.type === 'skin') setPreviewSkin(item.id);
      if (item.type === 'accessory') setPreviewAccessory(item.id);

      setItems((prev) =>
        prev.map((i) => {
          if (i.type === item.type) {
            return { ...i, isEquipped: i.id === item.id };
          }
          return i;
        })
      );
    } catch (err) {
      showMessage(err.message || 'Could not equip item.');
    }
  };

  const showMessage = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const filteredItems = items.filter((i) => i.type === activeTab);

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/arcade')} className="btn-secondary" style={{ padding: '0.45rem' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              BugBuddy Wardrobe & Shop
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Customize your mascot's appearance with earned coins
            </span>
          </div>
        </div>

        {/* Live Wallet & Sound Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '0.4rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#fbbf24',
            }}
          >
            🪙 {coins} Coins
          </div>
          <button
            onClick={toggleSound}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '0.45rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
            title={soundOn ? 'Sound On' : 'Sound Muted'}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} /> {actionMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Wardrobe Split View (Left: Mascot Fitting Room, Right: Shop Shelves) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '1.75rem', alignItems: 'start' }}>
        
        {/* Left: Fitting Room & Live Avatar */}
        <div
          className="card"
          style={{
            padding: '2rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(180deg, var(--bg-secondary) 0%, rgba(15, 23, 42, 0.4) 100%)',
            position: 'sticky',
            top: '20px',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
            Live Fitting Room
          </span>

          {/* Interactive Mascot */}
          <div style={{ height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BugMascot
              mood={previewMood}
              skin={previewSkin}
              accessory={previewAccessory}
              size={150}
            />
          </div>

          {/* Mood Expression Toggles */}
          <div style={{ display: 'flex', gap: '4px', margin: '1.25rem 0 1rem' }}>
            {['happy', 'excited', 'thinking', 'celebrate'].map((mood) => (
              <button
                key={mood}
                onClick={() => setPreviewMood(mood)}
                style={{
                  background: previewMood === mood ? 'var(--bg-tertiary)' : 'transparent',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  color: previewMood === mood ? 'var(--text-primary)' : 'var(--text-muted)',
                  textTransform: 'capitalize',
                }}
              >
                {mood}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            Click items on the right to test how they look before equipping.
          </p>
        </div>

        {/* Right: Catalog Items by Category */}
        <div>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('skin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'skin' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === 'skin' ? '#10b981' : 'var(--text-secondary)',
                fontWeight: activeTab === 'skin' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Palette size={15} /> Mascot Skins
            </button>
            <button
              onClick={() => setActiveTab('accessory')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'accessory' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'accessory' ? '#38bdf8' : 'var(--text-secondary)',
                fontWeight: activeTab === 'accessory' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Shirt size={15} /> Hats & Accessories
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'theme' ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                color: activeTab === 'theme' ? '#ec4899' : 'var(--text-secondary)',
                fontWeight: activeTab === 'theme' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Tag size={15} /> Arcade Themes
            </button>
          </div>

          {/* Items Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {filteredItems.map((item) => {
              const rarityColor = RARITY_COLORS[item.rarity] || '#94a3b8';
              const canAfford = coins >= item.price;
              const isSelectedPreview =
                (item.type === 'skin' && previewSkin === item.id) ||
                (item.type === 'accessory' && previewAccessory === item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'skin') setPreviewSkin(item.id);
                    if (item.type === 'accessory') setPreviewAccessory(item.id);
                  }}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    border: isSelectedPreview
                      ? '1.5px solid #38bdf8'
                      : item.isEquipped
                      ? '1.5px solid #10b981'
                      : '1px solid var(--border-subtle)',
                    background: isSelectedPreview
                      ? 'rgba(56, 189, 248, 0.05)'
                      : item.isEquipped
                      ? 'rgba(16, 185, 129, 0.05)'
                      : 'var(--bg-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: rarityColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {item.rarity}
                      </span>
                      {item.isEquipped && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Check size={11} /> EQUIPPED
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 1rem' }}>
                      {item.description}
                    </p>
                  </div>

                  <div>
                    {item.isOwned ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.isEquipped) handleEquip(item);
                        }}
                        disabled={item.isEquipped}
                        className={item.isEquipped ? 'btn-secondary' : 'btn-primary'}
                        style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem' }}
                      >
                        {item.isEquipped ? 'Currently Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuy(item);
                        }}
                        disabled={!canAfford}
                        className="btn-primary"
                        style={{
                          width: '100%',
                          fontSize: '0.78rem',
                          padding: '0.45rem',
                          background: canAfford ? '#fbbf24' : 'var(--bg-tertiary)',
                          borderColor: canAfford ? '#fbbf24' : 'transparent',
                          color: canAfford ? '#0f172a' : 'var(--text-muted)',
                        }}
                      >
                        Buy for 🪙 {item.price}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
