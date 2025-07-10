import { NextRequest, NextResponse } from 'next/server';
import docx4js from 'docx4js';

export const runtime = 'nodejs';

// 字段顺序与页面一致
const FIELD_KEYS = [
  'date', 'rfqNumber', 'customer', 'customerNumber', 'description', 'rfqUnit', 'status', 'priority'
];

function parseColor(val?: string) {
  if (!val) return '';
  if (val.startsWith('#')) return val;
  if (/^[0-9A-Fa-f]{6}$/.test(val)) return `#${val}`;
  return val;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file || !file.name.endsWith('.docx')) {
    return NextResponse.json({ error: '只支持.docx文件' }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 用 docx4js 解析
  const doc = await docx4js.load(buffer);
  const tables = doc.content.filter((el: any) => el.type === 'table');
  let result: any[] = [];
  for (const table of tables) {
    // 跳过表头，假设第一行为表头
    for (let i = 1; i < table.rows.length; i++) {
      const row = table.rows[i];
      const item: any = {};
      for (let j = 0; j < FIELD_KEYS.length; j++) {
        const cell = row.cells[j];
        if (!cell) {
          item[FIELD_KEYS[j]] = { text: '', color: '', backgroundColor: '' };
          continue;
        }
        // 合并所有段落文本
        let text = '';
        let color = '';
        let backgroundColor = '';
        for (const p of cell.paragraphs) {
          for (const r of p.runs) {
            text += r.text || '';
            if (r.properties && r.properties.color) {
              color = parseColor(r.properties.color.val);
            }
            if (r.properties && r.properties.shading && r.properties.shading.fill) {
              backgroundColor = parseColor(r.properties.shading.fill);
            }
          }
        }
        // cell shading（底色）优先级高于 run shading
        if (cell.properties && cell.properties.shading && cell.properties.shading.fill) {
          backgroundColor = parseColor(cell.properties.shading.fill);
        }
        item[FIELD_KEYS[j]] = { text: text.trim(), color, backgroundColor };
      }
      if (!item.rfqNumber || !item.rfqNumber.text) continue;
      if (!item.status.text) item.status = { text: 'pending', color: '', backgroundColor: '' };
      if (!item.priority.text) item.priority = { text: 'medium', color: '', backgroundColor: '' };
      result.push(item);
    }
  }
  return NextResponse.json(result);
} 