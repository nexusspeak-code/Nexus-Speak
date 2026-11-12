import React, { useState } from 'react';
import {
  Search,
  Star,
  Trash2,
  Download,
  Share2,
  Calendar,
  Languages,
  Mic,
  Sparkles,
  ArrowRight,
  Filter,
  FileText,
  FileJson,
} from 'lucide-react';
import { TranscriptionRecord } from '../types';

interface HistoryScreenProps {
  records: TranscriptionRecord[];
  historyEnabled: boolean;
  onSelectRecord: (record: TranscriptionRecord) => void;
  onToggleFavourite: (id: string) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onNavigateStudio: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  records,
  historyEnabled,
  onSelectRecord,
  onToggleFavourite,
  onDeleteRecord,
  onClearAll,
  onNavigateStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.output.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.transcript.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'favourite') return r.isFavourite;
    if (filterMode === 'transcribe') return r.mode === 'transcribe';
    if (filterMode === 'translate') return r.mode === 'translate';
    if (filterMode === 'rewrite') return r.mode === 'rewrite';
    return true;
  });

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexus_speak_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportMenu(false);
  };

  const exportAsTXT = () => {
    const content = records
      .map(
        (r, i) =>
          `[#${i + 1}] ${r.title} (${new Date(r.createdAt).toLocaleString()})\nMode: ${r.mode} | Language: ${
            r.sourceLanguage
          }${r.targetLanguage ? ` -> ${r.targetLanguage}` : ''}\n---\n${r.output || r.transcript}\n\n`
      )
      .join('========================================\n\n');

    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexus_speak_transcripts_${Date.now()}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportMenu(false);
  };

  return (
    <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '2px' }}>Saved Transcripts</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {records.length} {records.length === 1 ? 'item' : 'items'} stored locally
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          {records.length > 0 && (
            <>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}
                title="Export Transcriptions"
              >
                <Download size={13} />
                <span>Export</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete all saved transcripts? This action cannot be undone.')) {
                    onClearAll();
                  }
                }}
                style={{
                  padding: '6px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--accent-rose)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
                title="Delete All History"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}

          {/* Export Dropdown Menu */}
          {showExportMenu && (
            <div
              style={{
                position: 'absolute',
                top: '38px',
                right: 0,
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                zIndex: 60,
                width: '140px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={exportAsJSON}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  textAlign: 'left',
                }}
              >
                <FileJson size={14} />
                <span>Export JSON</span>
              </button>
              <button
                onClick={exportAsTXT}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  textAlign: 'left',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <FileText size={14} />
                <span>Export TXT</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {!historyEnabled && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '12px',
            color: 'var(--accent-amber)',
          }}
        >
          <strong>Privacy Mode Active:</strong> History saving is currently turned off in Settings. Existing records remain visible, but new recordings will not be retained.
        </div>
      )}

      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <Search size={15} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search transcriptions, notes, keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '13px',
            width: '100%',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'favourite', label: 'Starred' },
          { id: 'transcribe', label: 'Transcribe' },
          { id: 'translate', label: 'Translate' },
          { id: 'rewrite', label: 'Rewrite' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterMode(f.id)}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 600,
              background: filterMode === f.id ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
              color: filterMode === f.id ? '#ffffff' : 'var(--text-secondary)',
              border: `1px solid ${filterMode === f.id ? 'transparent' : 'var(--border-subtle)'}`,
              whiteSpace: 'nowrap',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* History Items List */}
      {filteredRecords.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredRecords.map((item) => (
            <div
              key={item.id}
              className="nexus-card"
              style={{
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
              }}
              onClick={() => onSelectRecord(item)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--accent-primary)',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.mode}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {item.sourceLanguage} {item.targetLanguage ? `→ ${item.targetLanguage}` : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavourite(item.id);
                    }}
                    style={{
                      color: item.isFavourite ? 'var(--accent-amber)' : 'var(--text-muted)',
                      padding: '2px',
                    }}
                    title="Toggle Star"
                  >
                    <Star size={15} fill={item.isFavourite ? 'var(--accent-amber)' : 'none'} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRecord(item.id);
                    }}
                    style={{ color: 'var(--text-muted)', padding: '2px' }}
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {item.title}
              </h4>

              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.output || item.transcript}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  Open Editor <ArrowRight size={11} />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Mic size={22} />
          </div>
          <h4 style={{ fontSize: '15px', marginBottom: '6px' }}>No Transcripts Found</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '240px', margin: '0 auto 16px' }}>
            {searchQuery ? 'No transcripts matched your search term.' : 'Record your first audio clip in the studio to see saved items here.'}
          </p>
          <button
            onClick={onNavigateStudio}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--grad-primary)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            Go to Voice Studio
          </button>
        </div>
      )}
    </div>
  );
};
