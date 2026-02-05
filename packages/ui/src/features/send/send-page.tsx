import React, { useState } from 'react';
import { sendEmail } from '../../api/client';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';

export const SendPage = () => {
  const [form, setForm] = useState({
    from: '',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    text: '',
    html: '',
  });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const splitList = (value: string): string[] =>
    value.split(',').map((entry) => entry.trim()).filter(Boolean);

  const onSubmit = async () => {
    setStatus(null);
    setLoading(true);
    try {
      const payload = {
        from: form.from,
        to: splitList(form.to),
        cc: splitList(form.cc),
        bcc: splitList(form.bcc),
        subject: form.subject,
        text: form.text || undefined,
        html: form.html || undefined,
      };
      const response = await sendEmail(payload);
      setStatus(`Email sent successfully! Message ID: ${response.messageId}`);
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
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Send Email</h2>
          <p className="text-sm text-text-secondary">
            Compose and send standard emails using SES SendEmail API.
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
          <CardDescription>Enter the details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                value={form.from}
                onChange={(e) => onChange('from', e.target.value)}
                placeholder="sender@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">
                To <span className="text-text-tertiary font-normal text-xs">(comma separated)</span>
              </Label>
              <Input
                id="to"
                value={form.to}
                onChange={(e) => onChange('to', e.target.value)}
                placeholder="recipient@example.com, other@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cc">CC</Label>
              <Input
                id="cc"
                value={form.cc}
                onChange={(e) => onChange('cc', e.target.value)}
                placeholder="cc@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bcc">BCC</Label>
              <Input
                id="bcc"
                value={form.bcc}
                onChange={(e) => onChange('bcc', e.target.value)}
                placeholder="bcc@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={form.subject}
              onChange={(e) => onChange('subject', e.target.value)}
              placeholder="Enter subject line..."
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text-body">Text Body</Label>
              <Textarea
                id="text-body"
                value={form.text}
                onChange={(e) => onChange('text', e.target.value)}
                placeholder="Plain text content..."
                className="font-mono text-sm min-h-[9.375rem]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="html-body">HTML Body</Label>
              <Textarea
                id="html-body"
                value={form.html}
                onChange={(e) => onChange('html', e.target.value)}
                placeholder="<p>HTML content...</p>"
                className="font-mono text-sm min-h-[9.375rem]"
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
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};
