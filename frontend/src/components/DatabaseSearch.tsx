import React, { useState } from 'react';
import { Search, Loader2, User, FileText, Tag, Clock } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import type { CaseCharacter, CaseEvidence, Suspect } from '../../../runtime/src/types.js';
import { characterIdToCharacterWindowToken, characterIdToInterrogationSourceRef } from '../../../runtime/src/utils/interrogationRefs.js';

interface DatabaseSearchProps {
  onOpenWindow: (type: string) => void;
}

type FilterType = 'all' | 'suspects' | 'evidence' | 'persons';

// Only generic category tags are player-facing — narrative identifier tags stay internal
const TAG_LABELS: Record<string, string> = {
  behavioral: 'سلوكي',
  forensics: 'جنائي',
  timeline: 'زمني',
  psychological: 'نفسي',
  body_language: 'لغة جسد',
  critical: 'حاسم',
  mislead: 'مُضلِّل',
  carryover: 'قضية مترابطة',
  carryover_link: 'قضية مترابطة',
  carryover_potential: 'قضية مترابطة',
  financial_crime: 'جرائم مالية',
  forgery: 'تزوير',
  cyber: 'إلكتروني',
  institutional_corruption: 'فساد مؤسسي',
};

interface SearchResult {
  id: string;
  title: string;
  type: 'مشتبه به' | 'دليل' | 'شخصية' | 'وثيقة';
  desc: string;
  tags?: string[];
  filterKey: FilterType;
  isSuspect?: boolean;
  isEvidence?: boolean;
  canInterrogate?: boolean;
}

export const DatabaseSearch: React.FC<DatabaseSearchProps> = ({ onOpenWindow }) => {
  const caseDefinition = useGameStore((s) => s.caseDefinition);
  const snapshot = useGameStore((s) => s.engineSnapshot);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const isCompactLayout = typeof window !== 'undefined' && window.innerWidth <= 768;

  const typeColors: Record<string, string> = {
    'مشتبه به': 'var(--state-warning)',
    'دليل': 'var(--interaction-cool)',
    'شخصية': '#a78bfa',
    'وثيقة': 'var(--state-success)',
  };

  const handleSearch = (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    if (!q) return;

    setIsSearching(true);
    setQuery(q);

    // Track recent
    setRecentSearches(prev => [q, ...prev.filter(s => s !== q)].slice(0, 5));

    setTimeout(() => {
      setIsSearching(false);
      const allResults: SearchResult[] = [];
      const lower = q.toLowerCase();

      // Suspects
      const suspects: Suspect[] = caseDefinition?.suspects || [];
      suspects.forEach(s => {
        if (
          s.name.includes(q) ||
          s.character_id.includes(lower) ||
          (s.occupation || '').includes(q) ||
          (s.public_profile || '').includes(q)
        ) {
          allResults.push({
            id: s.character_id,
            title: s.name,
            type: 'مشتبه به',
            desc: s.occupation || s.public_profile || '',
            filterKey: 'suspects',
            isSuspect: true,
          });
        }
      });

      // Evidence (unlocked)
      const evidenceList: CaseEvidence[] = caseDefinition?.evidence_list || [];
      evidenceList.forEach(ev => {
        const state = snapshot?.evidenceStates[ev.evidence_id];
        if (state === 'locked') return; // Skip locked evidence
        if (
          ev.title.includes(q) ||
          ev.evidence_id.toLowerCase().includes(lower) ||
          (ev.summary || '').includes(q) ||
          (ev.tags || []).some((t: string) => t.includes(lower))
        ) {
          allResults.push({
            id: ev.evidence_id,
            title: ev.title,
            type: ev.type === 'report' ? 'وثيقة' : 'دليل',
            desc: ev.summary || '',
            tags: ev.tags || [],
            filterKey: 'evidence',
            isEvidence: true,
          });
        }
      });

      // Related persons & witnesses — interrogable when they carry authored dialog
      const persons: CaseCharacter[] = [...(caseDefinition?.related_persons || []), ...(caseDefinition?.witnesses || [])];
      persons.forEach((p) => {
        if (
          (p.name || '').includes(q) ||
          (p.occupation || '').includes(q) ||
          (p.public_profile || '').includes(q)
        ) {
          const srcRef = p.character_id ? characterIdToInterrogationSourceRef(p.character_id) : '';
          const canInterrogate = !!p.character_id &&
            (caseDefinition?.supported_dialog_options?.[srcRef]?.length ?? 0) > 0;
          allResults.push({
            id: p.character_id || p.name,
            title: p.name,
            type: 'شخصية',
            desc: p.occupation || p.public_profile || p.role_in_case || '',
            filterKey: 'persons',
            canInterrogate,
          });
        }
      });

      setResults(allResults);
    }, 500);
  };

  const filteredResults = results === null
    ? null
    : activeFilter === 'all'
    ? results
    : results.filter(r => r.filterKey === activeFilter);

  const filterCounts = results === null ? {} : {
    all: results.length,
    suspects: results.filter(r => r.filterKey === 'suspects').length,
    evidence: results.filter(r => r.filterKey === 'evidence').length,
    persons: results.filter(r => r.filterKey === 'persons').length,
  };

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'الكل', icon: <Search size={12} /> },
    { key: 'suspects', label: 'مشتبه بهم', icon: <User size={12} /> },
    { key: 'evidence', label: 'أدلة', icon: <FileText size={12} /> },
    { key: 'persons', label: 'شخصيات', icon: <Tag size={12} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>
      {/* Search Input */}
      <form onSubmit={e => { e.preventDefault(); handleSearch(); }} style={{ display: 'flex', gap: isCompactLayout ? '0.4rem' : '0.5rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{
            position: 'absolute', right: '0.75rem', top: '50%',
            transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث بالاسم، رقم الدليل، الكلمة المفتاحية..."
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-window)',
              color: 'var(--text-primary)',
              padding: isCompactLayout ? '0.62rem 2.2rem 0.62rem 0.9rem' : '0.5rem 2.2rem 0.5rem 1rem',
              borderRadius: '6px',
              fontFamily: 'var(--font-arabic)',
              outline: 'none', fontSize: isCompactLayout ? '0.82rem' : '0.9rem',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--interaction-cool)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-window)'}
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: isCompactLayout ? 44 : 40,
            padding: isCompactLayout ? '0.55rem 0.8rem' : undefined,
          }}
        >
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </button>
      </form>

      {/* Recent Searches */}
      {results === null && recentSearches.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Clock size={12} style={{ opacity: 0.4 }} />
          {recentSearches.map(s => (
            <button key={s} onClick={() => handleSearch(s)} style={{
              fontSize: '0.72rem', padding: '2px 8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-window)',
              borderRadius: '12px', color: 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'var(--font-arabic)',
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Filters (show only when results exist) */}
      {results !== null && (
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          flexWrap: isCompactLayout ? 'nowrap' : 'wrap',
          overflowX: isCompactLayout ? 'auto' : 'visible',
          paddingBottom: isCompactLayout ? '0.15rem' : 0,
        }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: isCompactLayout ? '4px 10px' : '3px 10px',
                borderRadius: '12px', fontSize: isCompactLayout ? '0.72rem' : '0.75rem',
                fontFamily: 'var(--font-arabic)', cursor: 'pointer',
                background: activeFilter === f.key ? 'var(--interaction-cool)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${activeFilter === f.key ? 'var(--interaction-cool)' : 'var(--border-window)'}`,
                color: activeFilter === f.key ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {f.icon} {f.label}
              {filterCounts[f.key] !== undefined && filterCounts[f.key]! > 0 && (
                <span style={{
                  background: activeFilter === f.key ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '0 5px', fontSize: '0.65rem',
                }}>
                  {filterCounts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div style={{
        flex: 1, overflowY: 'auto',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-window)',
        borderRadius: '6px',
      }}>
        {results === null ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '0.5rem', opacity: 0.25,
          }}>
            <Search size={40} strokeWidth={1} />
            <p style={{ fontSize: '0.85rem' }}>أدخل مصطلح البحث</p>
          </div>
        ) : filteredResults!.length === 0 ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '0.5rem', opacity: 0.4,
          }}>
            <Search size={32} strokeWidth={1} />
            <p style={{ fontSize: '0.85rem', color: 'var(--state-warning)' }}>لا توجد سجلات مطابقة</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {filteredResults!.map((res, idx) => (
              <div
                key={res.id}
                className="database-result-card"
                data-result-id={res.id}
                onClick={() => {
                  if (res.isSuspect || res.canInterrogate) {
                    onOpenWindow(characterIdToCharacterWindowToken(res.id));
                  } else if (res.isEvidence) {
                    onOpenWindow(res.id);
                  }
                }}
                style={{
                  padding: isCompactLayout ? '0.75rem 0.85rem' : '0.8rem 1rem',
                  borderBottom: idx < filteredResults!.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  cursor: res.isSuspect || res.isEvidence || res.canInterrogate ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  if (res.isSuspect || res.isEvidence || res.canInterrogate) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: isCompactLayout ? '0.84rem' : '0.88rem', color: res.isSuspect ? 'var(--state-warning)' : res.isEvidence ? 'var(--interaction-cool)' : 'var(--text-primary)' }}>
                    {res.title}
                  </span>
                  <span style={{
                    fontSize: isCompactLayout ? '0.62rem' : '0.65rem', padding: '2px 7px', borderRadius: '10px',
                    background: `${typeColors[res.type]}22`,
                    color: typeColors[res.type],
                    border: `1px solid ${typeColors[res.type]}44`,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {res.type}
                  </span>
                </div>
                <div style={{ fontSize: isCompactLayout ? '0.76rem' : '0.8rem', lineHeight: 1.55, color: 'var(--text-secondary)', marginBottom: res.tags?.length ? '0.35rem' : 0 }}>
                  {res.desc}
                </div>
                {res.tags && res.tags.some(t => t in TAG_LABELS) && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {res.tags.filter(t => t in TAG_LABELS).slice(0, 4).map(tag => (
                      <span key={tag} style={{
                        fontSize: isCompactLayout ? '0.6rem' : '0.62rem', padding: '1px 6px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '4px', color: 'var(--text-secondary)',
                      }}>
                        {TAG_LABELS[tag]}
                      </span>
                    ))}
                  </div>
                )}
                {(res.isSuspect || res.isEvidence || res.canInterrogate) && (
                  <div style={{ marginTop: '0.35rem', fontSize: isCompactLayout ? '0.68rem' : '0.7rem', color: res.isSuspect || res.canInterrogate ? 'var(--state-warning)' : 'var(--interaction-cool)', opacity: 0.7 }}>
                    {res.isSuspect || res.canInterrogate ? '→ اضغط لبدء الاستجواب' : '→ اضغط لعرض الدليل'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
