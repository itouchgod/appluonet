export interface InvoiceTemplateConfig {
  headerType: 'bilingual' | 'english';
  invoiceType: 'invoice' | 'commercial' | 'proforma';
  stampType: 'shanghai' | 'hongkong' | 'none';
} 