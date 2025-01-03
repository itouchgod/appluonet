import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// 注册字体
Font.register({
  family: 'NotoSansSC',
  fonts: [
    { src: '/fonts/NotoSansSC-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/NotoSansSC-Bold.ttf', fontWeight: 'bold' },
  ],
});

// 定义样式
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'NotoSansSC',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #000000',
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1a365d',
  },
  companyInfo: {
    fontSize: 10,
    color: '#4a5568',
    textAlign: 'center',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  label: {
    fontSize: 10,
    color: '#4a5568',
    marginBottom: 4,
  },
  value: {
    fontSize: 11,
    color: '#1a202c',
    marginBottom: 8,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
  },
  tableHeader: {
    backgroundColor: '#f7fafc',
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    color: '#1a202c',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    borderRightStyle: 'solid',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#718096',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  stamp: {
    position: 'absolute',
    bottom: 100,
    right: 50,
    width: 100,
    height: 100,
    opacity: 0.9,
  },
  total: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1 solid #e2e8f0',
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a202c',
  },
});

interface PDFDocumentProps {
  type: 'quote' | 'invoice';
  data: any;
  stamp?: string;
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({ type, data, stamp }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 页眉 */}
        <View style={styles.header}>
          <Image
            style={styles.logo}
            src="/images/logo.png"
          />
          <Text style={styles.title}>
            {type === 'quote' ? '报价单' : '发票'}
          </Text>
          <Text style={styles.companyInfo}>
            LC Company Limited · 专业的外贸服务提供商
          </Text>
        </View>

        {/* 基本信息 */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>单据编号</Text>
              <Text style={styles.value}>{data.number}</Text>
              
              <Text style={styles.label}>日期</Text>
              <Text style={styles.value}>{data.date}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>客户信息</Text>
              <Text style={styles.value}>{data.customer}</Text>
              
              <Text style={styles.label}>联系方式</Text>
              <Text style={styles.value}>{data.contact || '---'}</Text>
            </View>
          </View>
        </View>

        {/* 商品列表 */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <Text style={styles.tableHeaderCell}>商品名称</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text style={styles.tableHeaderCell}>数量</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text style={styles.tableHeaderCell}>单价</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1 }]}>
              <Text style={styles.tableHeaderCell}>金额</Text>
            </View>
          </View>
          {data.items.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCell, { flex: 2 }]}>
                <Text>{item.name}</Text>
                {item.description && (
                  <Text style={{ fontSize: 8, color: '#718096', marginTop: 2 }}>
                    {item.description}
                  </Text>
                )}
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text>{item.quantity}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text>{item.price}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text>{item.amount}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 合计 */}
        <View style={styles.total}>
          <Text>总计: {data.total}</Text>
        </View>

        {/* 备注 */}
        {data.remarks && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.label}>备注</Text>
            <Text style={[styles.value, { fontSize: 10 }]}>{data.remarks}</Text>
          </View>
        )}

        {/* 印章 */}
        {stamp && (
          <Image
            style={styles.stamp}
            src={stamp}
          />
        )}

        {/* 页脚 */}
        <View style={styles.footer}>
          <Text>本文档由系统自动生成 · {new Date().toLocaleDateString('zh-CN')}</Text>
        </View>
      </Page>
    </Document>
  );
}; 