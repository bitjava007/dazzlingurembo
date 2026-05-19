'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { documentsService } from '@/services/documents.service';
import { toast } from '@/hooks/use-toast';
import { FileText, Download } from 'lucide-react';

interface DocumentType {
  title: string;
  description: string;
  downloadFn: (id: string) => Promise<Blob>;
  filename: (id: string) => string;
}

const documentTypes: DocumentType[] = [
  {
    title: 'Invoice PDF',
    description: 'Download a customer invoice as PDF',
    downloadFn: (id) => documentsService.downloadInvoicePdf(id),
    filename: (id) => `invoice-${id}.pdf`,
  },
  {
    title: 'Quotation PDF',
    description: 'Download a sales quotation as PDF',
    downloadFn: (id) => documentsService.downloadQuotationPdf(id),
    filename: (id) => `quotation-${id}.pdf`,
  },
  {
    title: 'Receipt PDF',
    description: 'Download a payment receipt as PDF',
    downloadFn: (id) => documentsService.downloadReceiptPdf(id),
    filename: (id) => `receipt-${id}.pdf`,
  },
  {
    title: 'Purchase Order PDF',
    description: 'Download a purchase order as PDF',
    downloadFn: (id) => documentsService.downloadPurchaseOrderPdf(id),
    filename: (id) => `purchase-order-${id}.pdf`,
  },
];

function DocumentCard({ doc }: { doc: DocumentType }) {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!id.trim()) { toast({ title: 'Please enter an ID', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const blob = await doc.downloadFn(id.trim());
      documentsService.openPdfInNewTab(blob, doc.filename(id.trim()));
    } catch {
      toast({ title: 'Download failed', description: 'Could not retrieve the document.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-lg p-6 hover:border-[#C9A84C]/30 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-md bg-[#C9A84C]/10">
          <FileText className="h-5 w-5 text-[#C9A84C]" />
        </div>
        <div>
          <h3 className="text-white font-semibold">{doc.title}</h3>
          <p className="text-gray-500 text-xs">{doc.description}</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-gray-400 text-xs">Document ID</Label>
        <div className="flex gap-2">
          <Input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Enter ID..."
            className="bg-[#1A1A1A] border-[#2A2A2A] text-white text-sm"
          />
          <Button
            onClick={handleDownload}
            disabled={loading}
            className="bg-[#C9A84C] hover:bg-[#D4AF37] text-black font-semibold shrink-0"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <div>
      <PageHeader title="Documents" subtitle="Download PDF documents" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documentTypes.map((doc) => (
          <DocumentCard key={doc.title} doc={doc} />
        ))}
      </div>
    </div>
  );
}
