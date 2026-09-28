import React, { useState } from '../core/react.js';
import { CULTURAL_EVENTS } from '../../config/eventConfig.js';

export function LiteraryCulturalSection({ onRegisterEvent }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      {/* Deliberate Editorial Transition Strip */}
      <section className="transition-strip">
        <div className="container">
          <div className="transition-inner">
            <div className="transition-quote">
              "From court discipline to the boundless possibilities of the stage —
              inter-collegiate brilliance defined through athletic precision and creative audacity."
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className="badge badge-outline">TRANSITION</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                SPORTS → CULTURAL
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Literary & Cultural Section */}
      <section className="section-wrapper cultural-section" id="cultural-section">
        <div className="container">
          <div className="section-header-editorial">
            <div>
              <span className="eyebrow eyebrow-cultural">
                <span className="eyebrow-dot"></span>
                CREATIVE EXPRESSION • 02
              </span>
              <h2 className="heading-section">
                LITERARY & CULTURAL
              </h2>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontStyle: 'italic', color: 'var(--accent-cultural)', marginTop: '0.25rem' }}>
                Expression takes many forms.
              </div>
            </div>
            <p className="text-body" style={{ maxWidth: '440px' }}>
              Eight distinct disciplines celebrating Indian classical heritage, contemporary theatre,
              experimental dance choreography, runway styling, digital craft, and forensic debate.
            </p>
          </div>

          {/* Magazine-Inspired Editorial Layout */}
          <div className="cultural-magazine-layout">
            {CULTURAL_EVENTS.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id} className="cultural-row">
                  {/* Category Number */}
                  <div className="cultural-row-num">
                    {item.number}
                  </div>

                  {/* Title & Category Sub-label */}
                  <div className="cultural-row-title-area">
                    <h3 className="cultural-row-name">{item.name}</h3>
                    <span className="cultural-row-sub">{item.subCategory}</span>
                    {item.subEvents && (
                      <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem' }}>
                        {item.subEvents.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="badge badge-terracotta"
                            style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}
                          >
                            {sub.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description & Disciplines */}
                  <div className="cultural-row-details">
                    <p className="cultural-row-desc">{item.shortDescription}</p>
                    <div className="cultural-disciplines">
                      {item.disciplines.map((d, dIdx) => (
                        <span key={dIdx} className="discipline-pill">
                          {d}
                        </span>
                      ))}
                    </div>

                    {isExpanded && (
                      <div style={{
                        marginTop: '0.875rem',
                        padding: '0.875rem',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem'
                      }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          Guidelines & Stage Technicals:
                        </div>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {item.guidelines}
                        </div>
                        <div style={{ marginTop: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          Format: {item.format} • Allocation: {item.duration}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Registration */}
                  <div className="cultural-row-actions">
                    <button
                      className="btn btn-cultural btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => onRegisterEvent('Literary & Cultural', 'Cultural / Open', item.name)}
                    >
                      <span>Register for {item.name}</span>
                    </button>

                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0'
                      }}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <span>{isExpanded ? 'Hide Guidelines' : 'Rules & Guidelines'}</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
