export interface InvoiceTemplateConfig {
  headerType: 'bilingual' | 'english' | 'none';
  invoiceType: 'invoice' | 'commercial' | 'proforma';
  stampType: 'shanghai' | 'hongkong' | 'none';
} 