import { Font, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { QuotationData, LineItem } from '@/types/quote';

// 注册字体
Font.register({
  family: 'FZLTHJW',
  src: '/fonts/FZLTHJW.ttf'
});

// 创建样式
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'FZLTHJW'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  section: {
    marginBottom: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5
  },
  label: {
    width: 100,
    fontSize: 10,
    color: '#666666'
  },
  value: {
    flex: 1,
    fontSize: 10
  },
  table: {
    marginVertical: 10
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 5,
    marginBottom: 5
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
    paddingVertical: 5
  },
  tableCell: {
    fontSize: 9
  },
  no: {
    width: '5%'
  },
  partName: {
    width: '25%'
  },
  description: {
    width: '20%'
  },
  quantity: {
    width: '10%',
    textAlign: 'right'
  },
  unit: {
    width: '10%'
  },
  unitPrice: {
    width: '15%',
    textAlign: 'right'
  },
  amount: {
    width: '15%',
    textAlign: 'right'
  },
  remarks: {
    width: '20%'
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#000000'
  },
  totalLabel: {
    fontSize: 10,
    marginRight: 10
  },
  totalAmount: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '15%',
    textAlign: 'right'
  },
  notes: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#cccccc'
  },
  note: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 3
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40
  },
  stamp: {
    width: 100,
    height: 100,
    position: 'absolute',
    right: 40,
    bottom: 40
  }
});

interface PDFDocumentProps {
  type: string;
  data: QuotationData;
  stamp?: string;
}

export function PDFDocument({ type, data, stamp }: PDFDocumentProps) {
  const showDescription = data.showDescription;
  const showRemarks = data.showRemarks;
  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    CNY: '¥'
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image 
            src="/dochead.jpg" 
            style={styles.logo}
            alt="Company Logo"
          />
          <Text style={{ fontSize: 10, color: '#666666' }}>
            {new Date(data.date).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.title}>
          {type === 'quotation' ? 'QUOTATION' : 'ORDER CONFIRMATION'}
        </Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>TO:</Text>
            <Text style={styles.value}>{data.to}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>FROM:</Text>
            <Text style={styles.value}>{data.from}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>INQUIRY NO.:</Text>
            <Text style={styles.value}>{data.inquiryNo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>
              {type === 'quotation' ? 'QUOTATION NO.:' : 'ORDER NO.:'}
            </Text>
            <Text style={styles.value}>{data.quotationNo}</Text>
          </View>
          {type === 'confirmation' && (
            <View style={styles.row}>
              <Text style={styles.label}>CONTRACT NO.:</Text>
              <Text style={styles.value}>{data.contractNo}</Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.no]}>No.</Text>
            <Text style={[styles.tableCell, styles.partName]}>Part Name</Text>
            {showDescription && (
              <Text style={[styles.tableCell, styles.description]}>Description</Text>
            )}
            <Text style={[styles.tableCell, styles.quantity]}>Qty</Text>
            <Text style={[styles.tableCell, styles.unit]}>Unit</Text>
            <Text style={[styles.tableCell, styles.unitPrice]}>Unit Price</Text>
            <Text style={[styles.tableCell, styles.amount]}>Amount</Text>
            {showRemarks && (
              <Text style={[styles.tableCell, styles.remarks]}>Remarks</Text>
            )}
          </View>

          {data.items.map((item: LineItem) => (
            <View key={item.lineNo} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.no]}>{item.lineNo}</Text>
              <Text style={[styles.tableCell, styles.partName]}>{item.partName}</Text>
              {showDescription && (
                <Text style={[styles.tableCell, styles.description]}>
                  {item.description}
                </Text>
              )}
              <Text style={[styles.tableCell, styles.quantity]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.unit]}>{item.unit}</Text>
              <Text style={[styles.tableCell, styles.unitPrice]}>
                {currencySymbols[data.currency]}{item.unitPrice.toFixed(2)}
              </Text>
              <Text style={[styles.tableCell, styles.amount]}>
                {currencySymbols[data.currency]}{item.amount.toFixed(2)}
              </Text>
              {showRemarks && (
                <Text style={[styles.tableCell, styles.remarks]}>{item.remarks}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>
            {currencySymbols[data.currency]}
            {data.items.reduce((sum: number, item: LineItem) => sum + item.amount, 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.notes}>
          {data.notes.map((note: string, index: number) => (
            <Text key={index} style={styles.note}>
              {note}
            </Text>
          ))}
        </View>

        {stamp && (
          <Image 
            src={stamp} 
            style={styles.stamp}
            alt="Company Stamp"
          />
        )}

        <View style={styles.footer}>
          <Text style={{ fontSize: 8, color: '#999999', textAlign: 'center' }}>
            {data.bankInfo}
          </Text>
        </View>
      </Page>
    </Document>
  );
} 