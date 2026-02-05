import React, { useEffect, useMemo, useRef, useState } from 'react';
import { deleteMessages, listMessages } from '../../api/client';
import { Message } from '@ses-admin/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { cn } from '../../lib/utils';

type MessageView = {
  key: string;
  id?: string;
  subject: string;
  from: string;
  to: string;
  timestamp: string;
  preview: string;
  textBody: string;
  htmlBody: string;
  raw: Message;
};

export const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [idFilter, setIdFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // --- URL Sync Logic ---
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.length > 0) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    const next = params.toString();
    const url = window.location.pathname + (next ? `?${next}` : '');
    window.history.replaceState({}, '', url);
  };

  const syncFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    setIdFilter(params.get('mid') ?? '');
    setEmailFilter(params.get('email') ?? '');
    setSearch(params.get('q') ?? '');
    setSelectedKey(params.get('id'));
  };

  useEffect(() => {
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  useEffect(() => {
    updateQuery({ mid: idFilter || null, email: emailFilter || null });
  }, [idFilter, emailFilter]);

  useEffect(() => {
    updateQuery({ q: search || null });
  }, [search]);

  // --- Data Loading ---
  const load = async () => {
    try {
      const response = await listMessages({
        id: idFilter || undefined,
        email: emailFilter || undefined,
      });
      setMessages(response.messages);
    } catch {
      // Silently handle errors
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // --- Filtering & Sorting ---
  const viewItems = useMemo<MessageView[]>(
    () =>
      messages.map((msg, index) => {
        const view = extractMessageView(msg);
        return {
          ...view,
          key: view.id ?? `idx-${index}`,
          raw: msg,
        };
      }),
    [messages]
  );

  const sortedItems = useMemo(() => {
    return [...viewItems].sort(compareMessageDesc);
  }, [viewItems]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sortedItems;
    return sortedItems.filter((item) => {
      const haystack = [
        item.subject,
        item.from,
        item.to,
        item.preview,
        item.textBody,
        item.htmlBody,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [search, sortedItems]);

  useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedKey(null);
      updateQuery({ id: null });
      return;
    }
    if (selectedKey && filteredItems.some((item) => item.key === selectedKey)) return;
  }, [filteredItems, selectedKey]);

  const selectMessage = (item: MessageView) => {
    setSelectedKey(item.key);
    updateQuery({ id: item.id ?? null });
  };

  const selectedItem = filteredItems.find((item) => item.key === selectedKey) ?? null;

  // --- Actions ---
  const onDeleteSelected = async () => {
    if (!selectedItem?.id) return;
    try {
      await deleteMessages({ id: selectedItem.id });
      await load();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const onDeleteAll = async () => {
    if (!window.confirm('Delete all messages?')) return;
    try {
      await deleteMessages({});
      await load();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);
      if (isTyping) return;

      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (event.key === 'r') {
        event.preventDefault();
        void load();
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        void onDeleteSelected();
        return;
      }
      if (event.key === 'j' || event.key === 'k') {
        event.preventDefault();
        if (filteredItems.length === 0) return;
        const currentIndex = filteredItems.findIndex((item) => item.key === selectedKey);
        const nextIndex = event.key === 'j' ? currentIndex + 1 : currentIndex - 1;
        const clamped = Math.max(0, Math.min(filteredItems.length - 1, nextIndex));
        selectMessage(filteredItems[clamped]);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filteredItems, selectedKey]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex-none p-3 border-b border-border-subtle bg-panel flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1">
            <Input
              ref={searchRef}
              placeholder="Search subject, from, to..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="h-6 w-px bg-border-subtle" />
          <Input
            placeholder="ID"
            value={idFilter}
            onChange={(e) => setIdFilter(e.target.value)}
            className="w-48 text-xs"
          />
          <Input
            placeholder="Email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="w-64 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={load} title="Refresh (r)">
            Refresh
          </Button>
          <Button variant="danger" size="sm" onClick={onDeleteSelected} disabled={!selectedItem} title="Delete (Del)">
            Delete
          </Button>
          <Button variant="danger" size="sm" onClick={onDeleteAll} title="Delete All">
            Delete All
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* List Pane */}
        <div className="w-80 md:w-96 border-r border-border-subtle bg-panel flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden overflow-y-auto">
            {filteredItems.length === 0 && (
              <div className="text-center py-10 px-4 text-text-tertiary text-sm">
                No messages found matching your criteria.
              </div>
            )}
            <div className="border-b border-border-subtle">
              {filteredItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => selectMessage(item)}
                  className={cn(
                    'w-full text-left p-4 transition-all relative',
                    'hover:bg-hover',
                    selectedKey === item.key && 'bg-primary-subtle'
                  )}
                >
                  {/* Active Indicator Line */}
                  {selectedKey === item.key && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}

                  <div className="flex justify-between items-baseline mb-1">
                    <span className={cn(
                      'text-sm font-semibold truncate flex-1 pr-2',
                      selectedKey === item.key ? 'text-primary' : 'text-text-primary'
                    )}>
                      {item.subject || '(No Subject)'}
                    </span>
                    <span className="text-xs text-text-tertiary whitespace-nowrap font-mono">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-text-secondary mb-1">
                    <span className="truncate font-medium">{item.from}</span>
                  </div>
                  <p className="text-xs text-text-tertiary line-clamp-2">
                    {item.preview || 'No preview available.'}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 border-t border-border-subtle text-xs text-text-tertiary bg-subtle text-center font-mono">
            {filteredItems.length} Messages
          </div>
        </div>

        {/* Detail Pane */}
        <div className="flex-1 overflow-hidden overflow-y-auto bg-background p-4 md:p-8">
          {selectedItem ? (
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
              <div className="border-none shadow-none bg-transparent pb-6 border-b border-border-subtle">
                <h1 className="text-2xl font-bold mb-4 text-text-primary leading-tight">
                  {selectedItem.subject || '(No Subject)'}
                </h1>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm text-text-secondary">
                  <span className="text-text-tertiary">From:</span>
                  <span className="font-medium text-text-primary select-text">{selectedItem.from}</span>

                  <span className="text-text-tertiary">To:</span>
                  <span className="select-text">{selectedItem.to}</span>

                  <span className="text-text-tertiary">Date:</span>
                  <span>{new Date(selectedItem.timestamp).toLocaleString()}</span>

                  {selectedItem.id && (
                    <>
                      <span className="text-text-tertiary">ID:</span>
                      <span className="font-mono text-xs truncate">{selectedItem.id}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Content Tabs */}
              <div className="flex flex-col gap-6">
                {selectedItem.htmlBody && (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
                      HTML Content
                    </h3>
                    <div className="rounded-lg border border-border-subtle bg-white overflow-hidden shadow-sm">
                      <div
                        className="p-8"
                        dangerouslySetInnerHTML={{ __html: selectedItem.htmlBody }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
                    Text Content
                  </h3>
                  <div className="rounded-lg border border-border-subtle bg-panel p-4 shadow-sm">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-text-secondary m-0">
                      {selectedItem.textBody || 'No text content.'}
                    </pre>
                  </div>
                </div>

                <details>
                  <summary className="cursor-pointer text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">
                    Raw JSON Source
                  </summary>
                  <div className="p-4 bg-subtle rounded-lg border border-border-subtle overflow-auto">
                    <pre className="text-xs font-mono text-text-secondary m-0">
                      {JSON.stringify(selectedItem.raw, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-text-tertiary opacity-50">
              <p className="font-medium">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Helpers

const formatTime = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const extractMessageView = (msg: Message): Omit<MessageView, 'key' | 'raw'> => {
  const raw = msg as Record<string, unknown>;
  const subject = (raw.Subject ?? raw.subject ?? raw.subject_line ?? '') as string;
  const from = (raw.Source ?? raw.from ?? '') as string;
  const toList =
    (raw.Destination as Record<string, unknown> | undefined)?.ToAddresses ??
    (raw.Destination as Record<string, unknown> | undefined)?.to ??
    raw.to ??
    raw.ToAddresses ??
    (raw.Destination as Record<string, unknown> | undefined)?.toAddresses ??
    [];
  const to = Array.isArray(toList) ? toList.join(', ') : String(toList ?? '');
  const timestamp = (raw.Timestamp ?? raw.timestamp ?? '') as string;

  const body = raw.Body as Record<string, unknown> | undefined;
  const textBody =
    (body?.text_part ??
      (body?.Text as Record<string, unknown> | undefined)?.Data ??
      (raw.body as Record<string, unknown> | undefined)?.text_part ??
      raw.text ??
      raw.Text ??
      '') as string;
  const htmlBody =
    (body?.html_part ??
      (body?.Html as Record<string, unknown> | undefined)?.Data ??
      (raw.body as Record<string, unknown> | undefined)?.html_part ??
      raw.html ??
      raw.Html ??
      '') as string;
  const previewSource = textBody || htmlBody || '';
  const preview = typeof previewSource === 'string' ? previewSource.trim().slice(0, 160) : '';

  return {
    id: (raw.Id ?? raw.id) as string | undefined,
    subject,
    from,
    to,
    timestamp,
    preview,
    textBody: typeof textBody === 'string' ? textBody : '',
    htmlBody: typeof htmlBody === 'string' ? htmlBody : '',
  };
};

const compareMessageDesc = (a: MessageView, b: MessageView) => {
  const parse = (value: string) => {
    if (!value) return 0;
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };
  const aTime = parse(a.timestamp);
  const bTime = parse(b.timestamp);
  if (aTime !== bTime) {
    return bTime - aTime;
  }
  const aEmail = (a.from || a.to || '').toLowerCase();
  const bEmail = (b.from || b.to || '').toLowerCase();
  if (aEmail !== bEmail) {
    return bEmail.localeCompare(aEmail);
  }
  const aId = a.id ?? '';
  const bId = b.id ?? '';
  return bId.localeCompare(aId);
};
