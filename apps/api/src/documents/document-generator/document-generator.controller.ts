import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DocumentGeneratorService } from './document-generator.service';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentGeneratorController {
  constructor(private readonly svc: DocumentGeneratorService) {}

  @Get('invoices/:id/pdf')
  @ApiOperation({ summary: 'Generate invoice document' })
  async invoicePdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.svc.generateInvoicePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    }).send(buffer);
  }

  @Get('quotations/:id/pdf')
  @ApiOperation({ summary: 'Generate quotation document' })
  async quotationPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.svc.generateQuotationPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    }).send(buffer);
  }

  @Get('receipts/:id/pdf')
  @ApiOperation({ summary: 'Generate receipt document' })
  async receiptPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.svc.generateReceiptPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    }).send(buffer);
  }

  @Get('delivery-notes/:id/pdf')
  @ApiOperation({ summary: 'Generate delivery note document' })
  async deliveryNotePdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.svc.generateDeliveryNotePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    }).send(buffer);
  }

  @Get('purchase-orders/:id/pdf')
  @ApiOperation({ summary: 'Generate purchase order document' })
  async purchaseOrderPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.svc.generatePurchaseOrderPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    }).send(buffer);
  }
}
