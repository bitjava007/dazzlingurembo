'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notificationsService } from '@/services/notifications.service';
import { toast } from '@/hooks/use-toast';
import type { NotificationTemplate, NotificationLog } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  channel: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']),
  subject: z.string().optional(),
  bodyTemplate: z.string().min(1, 'Body template is required'),
});
type TemplateFormData = z.infer<typeof templateSchema>;

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'templates' | 'logs'>('templates');
  const [templatePage, setTemplatePage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const [logStatus, setLogStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<NotificationTemplate | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TemplateFormData>({ resolver: zodResolver(templateSchema) });

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['notification-templates', templatePage],
    queryFn: () => notificationsService.getTemplates({ page: templatePage, limit: 20 }),
    enabled: activeTab === 'templates',
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['notification-logs', logPage, logStatus],
    queryFn: () => notificationsService.getLogs({ page: logPage, limit: 20, status: logStatus || undefined }),
    enabled: activeTab === 'logs',
  });

  const createM = useMutation({
    mutationFn: (d: TemplateFormData) => notificationsService.createTemplate(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-templates'] });
      setModalOpen(false);
      reset();
      toast({ title: 'Template created' });
    },
  });

  const updateM = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TemplateFormData }) => notificationsService.updateTemplate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-templates'] });
      setModalOpen(false);
      setEditTemplate(null);
      reset();
      toast({ title: 'Template updated' });
    },
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => notificationsService.deleteTemplate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notification-templates'] }); toast({ title: 'Template deleted' }); },
  });

  const openCreateModal = () => {
    setEditTemplate(null);
    reset();
    setModalOpen(true);
  };

  const openEditModal = (t: NotificationTemplate) => {
    setEditTemplate(t);
    setValue('name', t.name);
    setValue('code', t.code);
    setValue('channel', t.channel as 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP');
    setValue('subject', t.subject ?? '');
    setValue('bodyTemplate', t.bodyTemplate);
    setModalOpen(true);
  };

  const onSubmit = (d: TemplateFormData) => {
    if (editTemplate) {
      updateM.mutate({ id: editTemplate.id, data: d });
    } else {
      createM.mutate(d);
    }
  };

  const templateColumns = [
    { header: 'Name', accessor: 'name' as keyof NotificationTemplate },
    { header: 'Code', accessor: 'code' as keyof NotificationTemplate },
    { header: 'Channel', accessor: 'channel' as keyof NotificationTemplate },
    { header: 'Active', render: (r: NotificationTemplate) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    { header: 'Created At', render: (r: NotificationTemplate) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: 'Actions',
      render: (r: NotificationTemplate) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-blue-400 hover:text-blue-300" onClick={() => openEditModal(r)}>
            <Pencil className="h-3 w-3 mr-1" />Edit
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-red-400 hover:text-red-300" onClick={() => deleteM.mutate(r.id)}>
            <Trash2 className="h-3 w-3 mr-1" />Delete
          </Button>
        </div>
      ),
    },
  ];

  const logColumns = [
    { header: 'Recipient', accessor: 'recipient' as keyof NotificationLog },
    { header: 'Channel', accessor: 'channel' as keyof NotificationLog },
    { header: 'Status', render: (r: NotificationLog) => <StatusBadge status={r.status} /> },
    { header: 'Subject', render: (r: NotificationLog) => r.subject ?? '—' },
    { header: 'Sent At', render: (r: NotificationLog) => r.sentAt ? new Date(r.sentAt).toLocaleDateString() : '—' },
    { header: 'Entity Type', render: (r: NotificationLog) => r.entityType ?? '—' },
  ];

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Manage notification templates and logs"
        onAction={activeTab === 'templates' ? openCreateModal : undefined}
        actionLabel="New Template"
      />

      {/* Tabs */}
      <div className="flex border-b border-[#2A2A2A] mb-4">
        {(['templates', 'logs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-[#C9A84C] text-[#C9A84C]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'templates' && (
        <>
          <DataTable columns={templateColumns} data={templatesData?.data ?? []} loading={templatesLoading} keyExtractor={(r) => r.id} />
          <Pagination page={templatePage} totalPages={templatesData?.meta.totalPages ?? 1} onPageChange={setTemplatePage} />
        </>
      )}

      {activeTab === 'logs' && (
        <>
          <div className="mb-4">
            <select
              value={logStatus}
              onChange={(e) => { setLogStatus(e.target.value); setLogPage(1); }}
              className="h-10 rounded-md border border-[#2A2A2A] bg-[#111111] text-white px-3 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <DataTable columns={logColumns} data={logsData?.data ?? []} loading={logsLoading} keyExtractor={(r) => r.id} />
          <Pagination page={logPage} totalPages={logsData?.meta.totalPages ?? 1} onPageChange={setLogPage} />
        </>
      )}

      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editTemplate ? 'Edit Template' : 'New Template'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Name</Label>
              <Input {...register('name')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Code</Label>
              <Input {...register('code')} className="bg-[#111111] border-[#2A2A2A] text-white" />
              {errors.code && <p className="text-red-400 text-xs">{errors.code.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Channel</Label>
            <select {...register('channel')} className="w-full h-10 rounded-md border border-[#2A2A2A] bg-[#111111] text-white px-3">
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
              <option value="PUSH">Push</option>
              <option value="IN_APP">In App</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Subject (optional)</Label>
            <Input {...register('subject')} className="bg-[#111111] border-[#2A2A2A] text-white" />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Body Template</Label>
            <textarea
              {...register('bodyTemplate')}
              rows={4}
              className="w-full rounded-md border border-[#2A2A2A] bg-[#111111] text-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
              placeholder="Enter template body with {{variables}}"
            />
            {errors.bodyTemplate && <p className="text-red-400 text-xs">{errors.bodyTemplate.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400">Cancel</Button>
            <Button type="submit" disabled={createM.isPending || updateM.isPending} className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold">
              {editTemplate ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
