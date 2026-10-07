// Gera preview/index.html com todos os templates (dados fictícios), para revisar no navegador.
import { writeFile, mkdir } from 'node:fs/promises';
import { TEMPLATES } from '../src/index.js';

const brand = {
  name: 'Studio Exemplo', color: '#4f46e5', supportEmail: 'suporte@studioexemplo.com.br',
  address: 'Studio Exemplo Digital · São Paulo, SP',
};

const samples = {
  welcome: { name: 'Maria Souza', actionUrl: 'https://app.exemplo.com.br/entrar' },
  pix: {
    name: 'Maria Souza', amount: 149.9, dueDate: '2026-10-15', description: 'Plano Pro — outubro',
    pixCode: '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D',
    paymentUrl: 'https://pague.exemplo.com.br/fatura/123',
  },
  boleto: {
    name: 'Maria Souza', amount: 1234.56, dueDate: '2026-10-15', description: 'Mensalidade de outubro',
    digitableLine: '34191.09008 00012.345674 89012.345677 6 16000000123456', pdfUrl: 'https://pague.exemplo.com.br/boleto/123.pdf',
  },
  paymentReceived: { name: 'Maria Souza', amount: 149.9, paidAt: '2026-10-06', method: 'Pix', receiptUrl: 'https://app.exemplo.com.br/recibos/123' },
  overdue: { name: 'Maria Souza', amount: 149.9, dueDate: '2026-10-01', daysLate: 5, suspensionDate: '2026-10-11', paymentUrl: 'https://pague.exemplo.com.br/fatura/123' },
  passwordReset: { name: 'Maria Souza', resetUrl: 'https://app.exemplo.com.br/senha/nova?token=abc', expiresInMinutes: 30, ip: '203.0.113.7' },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const cards = Object.entries(samples).map(([name, data]) => {
  const { subject, html } = TEMPLATES[name](brand, data);
  return `<section><h2>${name}</h2><p class="subject">Assunto: ${subject.replace(/</g, '&lt;')}</p><iframe title="${name}" srcdoc="${esc(html)}"></iframe></section>`;
}).join('\n');

await mkdir('preview', { recursive: true });
await writeFile('preview/index.html', `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>email-templates-br · preview</title>
<style>body{margin:0;padding:24px 16px;background:#e2e8f0;font:14px system-ui,sans-serif;color:#0f172a}main{display:grid;gap:24px;grid-template-columns:repeat(auto-fill,minmax(min(100%,640px),1fr))}
h2{margin:0 0 4px;font-size:15px}.subject{margin:0 0 8px;color:#475569}iframe{width:100%;height:760px;border:0;border-radius:12px;background:#fff;box-shadow:0 1px 3px rgb(0 0 0/.12)}</style>
</head><body><main>${cards}</main></body></html>`);
console.log('preview/index.html gerado');
