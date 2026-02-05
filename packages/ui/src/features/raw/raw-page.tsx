import React, { useState } from 'react';
import { sendRawEmail } from '../../api/client';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';

export const RawPage = () => {
  const [form, setForm] = useState({
    from: '',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    text: '',
    html: '',
    raw: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async () => {
    setStatus(null);
    setLoading(true);
    try {
      const data = new FormData();
      data.append('from', form.from);
      data.append('to', form.to);
      if (form.cc) data.append('cc', form.cc);
      if (form.bcc) data.append('bcc', form.bcc);
      data.append('subject', form.subject);
      if (form.text) data.append('text', form.text);
      if (form.html) data.append('html', form.html);
      if (form.raw) data.append('raw', form.raw);
      if (files) {
        Array.from(files).forEach((file) => data.append('attachments', file));
      }
      const response = await sendRawEmail(data);
      setStatus(`Raw email sent successfully! Message ID: ${response.messageId}`);
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = status?.startsWith('Error') === false;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-none p-6 border-b border-border-subtle bg-background">
        <div className="max-w-5xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Raw & Attachments</h2>
          <p className="text-sm text-text-secondary">
            Send MIME emails or emails with attachments using SES SendRawEmail.
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <Card>
        <CardHeader>
          <CardTitle>Compose Raw Message</CardTitle>
          <CardDescription>Advanced sending options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="raw-from">From</Label>
              <Input
                id="raw-from"
                value={form.from}
                onChange={(e) => onChange('from', e.target.value)}
                placeholder="sender@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raw-to">To</Label>
              <Input
                id="raw-to"
                value={form.to}
                onChange={(e) => onChange('to', e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="raw-cc">CC</Label>
              <Input
                id="raw-cc"
                value={form.cc}
                onChange={(e) => onChange('cc', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raw-bcc">BCC</Label>
              <Input
                id="raw-bcc"
                value={form.bcc}
                onChange={(e) => onChange('bcc', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raw-subject">Subject</Label>
            <Input
              id="raw-subject"
              value={form.subject}
              onChange={(e) => onChange('subject', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="raw-text">Text Body</Label>
              <Textarea
                id="raw-text"
                value={form.text}
                onChange={(e) => onChange('text', e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raw-html">HTML Body</Label>
              <Textarea
                id="raw-html"
                value={form.html}
                onChange={(e) => onChange('html', e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="p-4 bg-subtle rounded-lg border border-border-subtle space-y-4">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Advanced
            </h4>
            <div className="space-y-2">
              <Label htmlFor="raw-mime">Raw MIME (Optional)</Label>
              <Textarea
                id="raw-mime"
                value={form.raw}
                onChange={(e) => onChange('raw', e.target.value)}
                placeholder="Content-Type: text/plain..."
                className="font-mono text-sm min-h-[7.5rem]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="raw-files">Attachments</Label>
              <Input
                id="raw-files"
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="cursor-pointer text-sm"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
            <div className="flex-1 mr-4">
              {status && (
                <span
                  className={cn(
                    'inline-flex px-3 py-2 rounded-md font-medium text-sm',
                    isSuccess
                      ? 'bg-success-subtle text-success-text border border-success-primary'
                      : 'bg-danger-subtle text-danger-text border border-danger-primary'
                  )}
                >
                  {status}
                </span>
              )}
            </div>
            <Button variant="primary" onClick={onSubmit} disabled={loading} size="lg">
              {loading ? 'Sending...' : 'Send Raw Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};
