import React, { useEffect, useState } from 'react';
import { deleteIdentity, listIdentities, verifyIdentity } from '@ses-admin/ui/api/client';
import { Identity } from '@ses-admin/shared';
import { Button } from '@ses-admin/ui/components/ui/button';
import { Input } from '@ses-admin/ui/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ses-admin/ui/components/ui/card';
import { Label } from '@ses-admin/ui/components/ui/label';
import { Badge } from '@ses-admin/ui/components/ui/badge';
import { cn } from '@ses-admin/ui/lib/utils';

export const IdentitiesPage = () => {
  const [items, setItems] = useState<Identity[]>([]);
  const [identity, setIdentity] = useState('');
  const [type, setType] = useState<'email' | 'domain'>('email');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const response = await listIdentities();
      setItems(response.items);
    } catch (error) {
      setMsg((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onVerify = async () => {
    setMsg(null);
    try {
      await verifyIdentity({ identity, type });
      setIdentity('');
      await load();
      setMsg('Identity verification requested.');
    } catch (error) {
      setMsg((error as Error).message);
    }
  };

  const onDelete = async (value: string) => {
    setMsg(null);
    try {
      await deleteIdentity(value);
      await load();
      setMsg('Identity deleted.');
    } catch (error) {
      setMsg((error as Error).message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-none p-6 border-b border-border-subtle bg-background">
        <div className="max-w-5xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Identities</h2>
          <p className="text-sm text-text-secondary">
            Manage verified email addresses and domains for sending.
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Verification Form */}
          <Card>
            <CardHeader>
              <CardTitle>Verify New Identity</CardTitle>
              <CardDescription>Add a new email or domain to your allowed list.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="identity-input">Identity</Label>
                    <Input
                      id="identity-input"
                      placeholder="user@example.com"
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="identity-type">Type</Label>
                    <select
                      id="identity-type"
                      className={cn(
                        'flex h-9 w-full rounded-md border border-border-subtle',
                        'bg-input px-3 py-1 text-sm text-text-primary',
                        'focus:outline-none focus:ring-2 focus:ring-primary',
                        'cursor-pointer',
                      )}
                      value={type}
                      onChange={(e) => setType(e.target.value as 'email' | 'domain')}
                    >
                      <option value="email">Email Address</option>
                      <option value="domain">Domain</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="primary" onClick={onVerify} disabled={!identity || loading}>
                    {loading ? 'Verifying...' : 'Verify Identity'}
                  </Button>
                </div>
              </div>
              {msg && (
                <p className="mt-4 text-sm p-2 rounded-md bg-subtle border border-border-subtle text-text-secondary">
                  {msg}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Identity List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Verified Identities</CardTitle>
                <CardDescription>List of all registered identities.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <div className="text-center py-12 text-text-tertiary">No identities found.</div>
              ) : (
                <div className="w-full">
                  {/* Table Header */}
                  <div className="flex items-center bg-subtle border-b border-border-subtle px-6 py-2">
                    <div className="flex-1 text-xs font-medium text-text-secondary uppercase">
                      Identity
                    </div>
                    <div className="w-24 text-xs font-medium text-text-secondary uppercase">
                      Type
                    </div>
                    <div className="w-24 text-right text-xs font-medium text-text-secondary uppercase">
                      Actions
                    </div>
                  </div>
                  {/* Table Rows */}
                  <div>
                    {items.map((item) => (
                      <div
                        key={item.identity}
                        className="flex items-center px-6 py-4 border-b border-border-subtle hover:bg-hover transition-colors"
                      >
                        <div className="flex-1 font-mono text-sm text-text-primary truncate pr-4">
                          {item.identity}
                        </div>
                        <div className="w-24">
                          <Badge variant={item.type === 'email' ? 'outline' : 'secondary'}>
                            {item.type}
                          </Badge>
                        </div>
                        <div className="w-24 text-right">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(item.identity)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
