import React, { useState, useEffect } from '../core/react.js';
import CylinderCarousel from './ui/cylinder-carousel.js';
import TextAnimation from './ui/staggerText.js';

export const GALLERY_ITEMS = [
  {
    src: "/gallery/dance.jpeg",
    alt: "Classical & Folk Dance Arena",
    title: "Classical & Folk Dance",
    category: "Stage Arts"
  },
  {
    src: "/gallery/hall.jpeg",
    alt: "Silver Jubilee Auditorium",
    title: "Silver Jubilee Auditorium",
    category: "Venue"
  },
  {
    src: "/gallery/welcome.jpeg",
    alt: "Grand Inaugural Ceremony",
    title: "Inaugural Ceremony",
    category: "Ceremony"
  },
  {
    src: "/gallery/1.jpg",
    alt: "Athletic Track & Sports Grounds",
    title: "Championship Track",
    category: "Sports Arena"
  },
  {
    src: "/gallery/2.jpg",
    alt: "Campus Stadium Highlights",
    title: "Stadium Spectacle",
    category: "Athletics"
  },
  {
    src: "/gallery/6.jpg.jpeg",
    alt: "College Festival Celebrations",
    title: "Festive Spirit",
    category: "Campus Life"
  },
  {
    src: "/gallery/7.jpg.jpeg",
    alt: "Student Tournament Laurels",
    title: "Tournament Laurels",
    category: "Competitions"
  },
  {
    src: "/gallery/8.jpg.jpeg",
    alt: "University Sports Grounds",
    title: "Championship Courts",
    category: "Sports"
  },
  {
    src: "/gallery/9.jpg.jpeg",
    alt: "Open Air Theatre Showcase",
    title: "Open Air Showcase",
    category: "Cultural Meet"
  },
  {
    src: "/gallery/12.jpg.jpeg",
    alt: "Campus Gathering & Competitions",
    title: "Campus Gathering",
    category: "Campus Events"
  },
  {
    src: "/gallery/38.JPG.jpeg",
    alt: "COLORIDO Championship Highlights",
    title: "COLORIDO Championship",
    category: "Highlights"
  }
];

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [duration, setDuration] = useState(32);
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter gallery images dynamically
  const filteredImages = activeFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => {
        if (activeFilter === 'sports') return item.category.toLowerCase().includes('sport') || item.category.toLowerCase().includes('athletic');
        if (activeFilter === 'cultural') return item.category.toLowerCase().includes('stage') || item.category.toLowerCase().includes('cultural') || item.category.toLowerCase().includes('ceremony');
        if (activeFilter === 'campus') return item.category.toLowerCase().includes('campus') || item.category.toLowerCase().includes('venue');
        return true;
      });

  const handleOpenLightbox = (image, index) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    const nextIdx = (selectedIndex + 1) % filteredImages.length;
    setSelectedIndex(nextIdx);
    setSelectedImage(filteredImages[nextIdx]);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    const prevIdx = (selectedIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedIndex(prevIdx);
    setSelectedImage(filteredImages[prevIdx]);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedIndex, filteredImages]);

  return (
    <section className="section-wrapper gallery-section" id="gallery-section">
      <div className="container">
        {/* Editorial Section Header */}
        <div className="section-header-editorial">
          <div>
            <span className="eyebrow eyebrow-cultural">
              <span className="eyebrow-dot"></span>
              CAMPUS &amp; EVENT ARCHIVES • 03
            </span>
            <h2 className="heading-section">
              <TextAnimation divideBy="word" delay={0.1}>
                COLORIDO GALLERY
              </TextAnimation>
            </h2>
            <div className="gallery-section-sub">
              Memories forged in competition and celebrated on stage.
            </div>
          </div>
          <div className="gallery-header-meta">
            <span className="badge badge-outline">3D REVOLVING EXHIBIT</span>
            <span className="gallery-count-lbl">
              {filteredImages.length} High-Resolution Captures
            </span>
          </div>
        </div>

        {/* Dynamic Controls Bar */}
        <div className="gallery-controls-bar">
          <div className="gallery-filter-chips">
            <button
              className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Glimpses ({GALLERY_ITEMS.length})
            </button>
            <button
              className={`filter-chip ${activeFilter === 'sports' ? 'active' : ''}`}
              onClick={() => setActiveFilter('sports')}
            >
              Sports Grounds
            </button>
            <button
              className={`filter-chip ${activeFilter === 'cultural' ? 'active' : ''}`}
              onClick={() => setActiveFilter('cultural')}
            >
              Cultural &amp; Stages
            </button>
            <button
              className={`filter-chip ${activeFilter === 'campus' ? 'active' : ''}`}
              onClick={() => setActiveFilter('campus')}
            >
              Campus &amp; Venues
            </button>
          </div>

          <div className="gallery-speed-toggles">
            <span className="speed-lbl">Rotation Speed:</span>
            <button
              className={`speed-btn ${duration === 48 ? 'active' : ''}`}
              onClick={() => setDuration(48)}
              title="Slow rotation"
            >
              Gentle
            </button>
            <button
              className={`speed-btn ${duration === 32 ? 'active' : ''}`}
              onClick={() => setDuration(32)}
              title="Standard rotation"
            >
              Normal
            </button>
            <button
              className={`speed-btn ${duration === 18 ? 'active' : ''}`}
              onClick={() => setDuration(18)}
              title="Brisk rotation"
            >
              Dynamic
            </button>
          </div>
        </div>

        {/* 3D Cylinder Carousel Wrapper */}
        <div className="gallery-carousel-stage">
          <div className="gallery-ambient-glow" aria-hidden="true" />
          
          <CylinderCarousel
            key={`${activeFilter}-${duration}`}
            images={filteredImages}
            animationDuration={duration}
            cardWidth={240}
            onImageClick={handleOpenLightbox}
            className="gallery-cylinder-inner"
          />

          {/* Interactive Hint */}
          <div className="gallery-interaction-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>Hover to pause • Click card for full-resolution view</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Full-Screen Lightbox Modal */}
      {selectedImage && (
        <div className="gallery-lightbox-backdrop" onClick={handleCloseLightbox}>
          <div className="gallery-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              className="gallery-lightbox-close"
              onClick={handleCloseLightbox}
              aria-label="Close photo preview"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <button
              className="gallery-lightbox-nav prev"
              onClick={handlePrev}
              aria-label="Previous photo"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              className="gallery-lightbox-nav next"
              onClick={handleNext}
              aria-label="Next photo"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="gallery-lightbox-media-wrapper">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt || selectedImage.title}
                className="gallery-lightbox-img"
              />
            </div>

            <div className="gallery-lightbox-footer">
              <div>
                <span className="lightbox-cat-badge">{selectedImage.category || 'COLORIDO 2K26'}</span>
                <h4 className="lightbox-title">{selectedImage.title}</h4>
                <p className="lightbox-alt">{selectedImage.alt}</p>
              </div>
              <div className="lightbox-index-badge">
                {selectedIndex + 1} / {filteredImages.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default GallerySection;
