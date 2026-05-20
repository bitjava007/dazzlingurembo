'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { crmService } from '@/services/crm.service';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { Trash2 } from 'lucide-react';
import type { CustomerNote, CustomerCommunication } from '@/types';

type Tab = 'notes' | 'communications' | 'loyalty';

interface NoteFormData {
  content: string;
}

interface CommFormData {
  channel: string;
  direction: string;
  subject: string;
  body: string;
}

interface AddPointsFormData {
  points: number;
  type: string;
  description: string;
}

interface RedeemFormData {
  points: number;
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('notes');

  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => crmService.getCustomer(id),
    enabled: !!id,
  });

  const { data: notes = [], isLoading: loadingNotes } = useQuery({
    queryKey: ['customer-notes', id],
    queryFn: () => crmService.getNotes(id),
    enabled: !!id && activeTab === 'notes',
  });

  const { data: communications = [], isLoading: loadingComms } = useQuery({
    queryKey: ['customer-communications', id],
    queryFn: () => crmService.getCommunications(id),
    enabled: !!id && activeTab === 'communications',
  });

  const { data: loyalty, isLoading: loadingLoyalty } = useQuery({
    queryKey: ['customer-loyalty', id],
    queryFn: () => crmService.getLoyaltyAccount(id),
    enabled: !!id && activeTab === 'loyalty',
  });

  const noteForm = useForm<NoteFormData>({ defaultValues: { content: '' } });
  const commForm = useForm<CommFormData>({ defaultValues: { channel: 'EMAIL', direction: 'OUTBOUND', subject: '', body: '' } });
  const addPointsForm = useForm<AddPointsFormData>({ defaultValues: { points: 0, type: 'MANUAL', description: '' } });
  const redeemForm = useForm<RedeemFormData>({ defaultValues: { points: 0 } });

  const addNoteMutation = useMutation({
    mutationFn: (d: NoteFormData) => crmService.addNote(id, { content: d.content }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer-notes', id] }); noteForm.reset(); toast({ title: 'Note added' }); },
    onError: () => toast({ title: 'Error adding note', variant: 'destructive' }),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => crmService.deleteNote(id, noteId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer-notes', id] }); toast({ title: 'Note deleted' }); },
    onError: () => toast({ title: 'Error deleting note', variant: 'destructive' }),
  });

  const addCommMutation = useMutation({
    mutationFn: (d: CommFormData) => crmService.addCommunication(id, { channel: d.channel, direction: d.direction, subject: d.subject, body: d.body }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer-communications', id] }); commForm.reset({ channel: 'EMAIL', direction: 'OUTBOUND', subject: '', body: '' }); toast({ title: 'Communication logged' }); },
    onError: () => toast({ title: 'Error logging communication', variant: 'destructive' }),
  });

  const addPointsMutation = useMutation({
    mutationFn: (d: AddPointsFormData) => crmService.addLoyaltyPoints(id, { points: Number(d.points), type: d.type, description: d.description }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer-loyalty', id] }); addPointsForm.reset({ points: 0, type: 'MANUAL', description: '' }); toast({ title: 'Points added' }); },
    onError: () => toast({ title: 'Error adding points', variant: 'destructive' }),
  });

  const redeemPointsMutation = useMutation({
    mutationFn: (d: RedeemFormData) => crmService.redeemLoyaltyPoints(id, { points: Number(d.points) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer-loyalty', id] }); redeemForm.reset({ points: 0 }); toast({ title: 'Points redeemed' }); },
    onError: () => toast({ title: 'Error redeeming points', variant: 'destructive' }),
  });

  if (loadingCustomer) {
    return <div className="text-gray-400 p-6">Loading...</div>;
  }

  if (!customer) {
    return <div className="text-gray-400 p-6">Customer not found.</div>;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'notes', label: 'Notes' },
    { key: 'communications', label: 'Communications' },
    { key: 'loyalty', label: 'Loyalty' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {customer.firstName} {customer.lastName}
              {customer.isVip && (
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-[#C9A84C] text-black rounded">VIP</span>
              )}
            </h1>
            <p className="text-gray-400 mt-1">Code: {customer.code}</p>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={customer.tier} />
              <StatusBadge status={customer.status} />
            </div>
          </div>
          <div className="text-right text-sm text-gray-400">
            {customer.email && <p>{customer.email}</p>}
            {customer.phone && <p>{customer.phone}</p>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#2A2A2A] flex gap-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Add Note</h3>
            <form onSubmit={noteForm.handleSubmit((d) => addNoteMutation.mutate(d))} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-gray-300">Content</Label>
                <textarea
                  {...noteForm.register('content', { required: true })}
                  className="w-full bg-[#111111] border border-[#2A2A2A] text-white rounded-md p-2 min-h-[80px] text-sm focus:outline-none focus:border-[#C9A84C]"
                  placeholder="Write a note..."
                />
              </div>
              <Button type="submit" disabled={addNoteMutation.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">
                Add Note
              </Button>
            </form>
          </div>

          {loadingNotes ? (
            <div className="text-gray-400">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No notes yet.</div>
          ) : (
            <div className="space-y-2">
              {notes.map((note: CustomerNote) => (
                <div key={note.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <p className="text-gray-300 text-sm">{note.content}</p>
                    <p className="text-gray-500 text-xs mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-red-400"
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                    disabled={deleteNoteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Communications Tab */}
      {activeTab === 'communications' && (
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Log Communication</h3>
            <form onSubmit={commForm.handleSubmit((d) => addCommMutation.mutate(d))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-gray-300">Channel</Label>
                  <select
                    {...commForm.register('channel', { required: true })}
                    className="w-full bg-[#111111] border border-[#2A2A2A] text-white rounded-md p-2 text-sm focus:outline-none focus:border-[#C9A84C]"
                  >
                    {['EMAIL', 'PHONE', 'SMS', 'IN_PERSON', 'WHATSAPP', 'OTHER'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-300">Direction</Label>
                  <select
                    {...commForm.register('direction', { required: true })}
                    className="w-full bg-[#111111] border border-[#2A2A2A] text-white rounded-md p-2 text-sm focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="OUTBOUND">Outbound</option>
                    <option value="INBOUND">Inbound</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-gray-300">Subject</Label>
                <Input {...commForm.register('subject')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="Subject (optional)" />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-300">Body</Label>
                <textarea
                  {...commForm.register('body')}
                  className="w-full bg-[#111111] border border-[#2A2A2A] text-white rounded-md p-2 min-h-[80px] text-sm focus:outline-none focus:border-[#C9A84C]"
                  placeholder="Message content..."
                />
              </div>
              <Button type="submit" disabled={addCommMutation.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">
                Log Communication
              </Button>
            </form>
          </div>

          {loadingComms ? (
            <div className="text-gray-400">Loading communications...</div>
          ) : communications.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No communications yet.</div>
          ) : (
            <div className="space-y-2">
              {communications.map((comm: CustomerCommunication) => (
                <div key={comm.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#2A2A2A] text-gray-300">{comm.channel}</span>
                    <span className="text-xs text-gray-500">{comm.direction}</span>
                    {comm.subject && <span className="text-sm text-white font-medium">{comm.subject}</span>}
                  </div>
                  {comm.body && <p className="text-gray-300 text-sm">{comm.body}</p>}
                  <p className="text-gray-500 text-xs mt-1">{new Date(comm.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loyalty Tab */}
      {activeTab === 'loyalty' && (
        <div className="space-y-4">
          {loadingLoyalty ? (
            <div className="text-gray-400">Loading loyalty data...</div>
          ) : loyalty ? (
            <>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
                <h3 className="text-white font-medium mb-4">Loyalty Account</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#C9A84C]">{loyalty.points}</p>
                    <p className="text-gray-400 text-sm mt-1">Current Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">{loyalty.totalEarned}</p>
                    <p className="text-gray-400 text-sm mt-1">Total Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-400">{loyalty.totalRedeemed}</p>
                    <p className="text-gray-400 text-sm mt-1">Total Redeemed</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Add Points</h3>
                  <form onSubmit={addPointsForm.handleSubmit((d) => addPointsMutation.mutate(d))} className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Points</Label>
                      <Input type="number" {...addPointsForm.register('points', { min: 1 })} className="bg-[#111111] border-[#2A2A2A] text-white" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-300">Type</Label>
                      <Input {...addPointsForm.register('type')} className="bg-[#111111] border-[#2A2A2A] text-white" placeholder="e.g. PURCHASE, BONUS" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-300">Description</Label>
                      <Input {...addPointsForm.register('description')} className="bg-[#111111] border-[#2A2A2A] text-white" />
                    </div>
                    <Button type="submit" disabled={addPointsMutation.isPending} className="w-full bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">
                      Add Points
                    </Button>
                  </form>
                </div>

                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Redeem Points</h3>
                  <form onSubmit={redeemForm.handleSubmit((d) => redeemPointsMutation.mutate(d))} className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Points to Redeem</Label>
                      <Input type="number" {...redeemForm.register('points', { min: 1 })} className="bg-[#111111] border-[#2A2A2A] text-white" />
                    </div>
                    <Button type="submit" disabled={redeemPointsMutation.isPending} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold mt-6">
                      Redeem Points
                    </Button>
                  </form>
                </div>
              </div>

              {loyalty.transactions && loyalty.transactions.length > 0 && (
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Recent Transactions</h3>
                  <div className="space-y-2">
                    {loyalty.transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center text-sm border-b border-[#2A2A2A] pb-2">
                        <div>
                          <span className="text-gray-300">{tx.type}</span>
                          {tx.description && <span className="text-gray-500 ml-2">— {tx.description}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={tx.points > 0 ? 'text-green-400' : 'text-red-400'}>
                            {tx.points > 0 ? '+' : ''}{tx.points}
                          </span>
                          <span className="text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-center py-8">No loyalty account found.</div>
          )}
        </div>
      )}
    </div>
  );
}
