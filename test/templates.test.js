import { test } from 'node:test';
import assert from 'node:assert/strict';
import { welcome, pix, boleto, paymentReceived, overdue, passwordReset, esc, safeUrl, TEMPLATES } from '../src/index.js';

const brand = { name: 'Studio Exemplo', color: '#4f46e5', supportEmail: 'suporte@exemplo.com.br' };

test('todo template devolve assunto, HTML completo e versão em texto', () => {
  const samples = {
    welcome: { name: 'Maria Souza', actionUrl: 'https://app.exemplo.com.br' },
    pix: { name: 'Maria', amount: 149.9, dueDate: '2026-10-15', pixCode: '000201...6304ABCD' },
    boleto: { name: 'Maria', amount: 10, dueDate: '2026-10-15', digitableLine: '34191.09008 00012.345674 89012.345677 6 16000000123456' },
    paymentReceived: { name: 'Maria', amount: 10, paidAt: '2026-10-06' },
    overdue: { name: 'Maria', amount: 10, dueDate: '2026-10-01', paymentUrl: 'https://pague.exemplo' },
    passwordReset: { name: 'Maria', resetUrl: 'https://app.exemplo/senha?t=1' },
  };
  for (const [name, data] of Object.entries(samples)) {
    const out = TEMPLATES[name](brand, data);
    assert.ok(out.subject.length > 5, name);
    assert.match(out.html, /^<!doctype html>/, name);
    assert.match(out.html, /lang="pt-BR"/, name);
    assert.ok(out.text.includes('Maria'), name);
    assert.ok(!/<[a-z]/i.test(out.text), `${name}: texto sem HTML`);
  }
});

test('valores e datas no formato brasileiro', () => {
  const out = pix(brand, { name: 'Maria Souza', amount: 1234.5, dueDate: '2026-10-15', pixCode: 'X' });
  assert.equal(out.subject, 'Pix de R$ 1.234,50 — vence em 15/10/2026');
  assert.ok(out.html.includes('R$ 1.234,50'));
  assert.ok(out.text.includes('Valor: R$ 1.234,50 — vencimento 15/10/2026'));
});

test('escapa dados do cliente (sem injeção de HTML)', () => {
  const out = welcome(brand, { name: '<script>alert(1)</script> Ana', actionUrl: 'https://app.exemplo' });
  assert.ok(!out.html.includes('<script>'));
  assert.ok(out.html.includes('&lt;script&gt;'));
  assert.equal(esc(`"'&<>`), '&quot;&#39;&amp;&lt;&gt;');
});

test('assunto sem quebra de linha (injeção de cabeçalho)', () => {
  const out = welcome(brand, { name: 'Ana\r\nBcc: alvo@exemplo.com', actionUrl: 'https://app.exemplo' });
  assert.ok(!/[\r\n]/.test(out.subject));
});

test('bloqueia links perigosos', () => {
  assert.throws(() => welcome(brand, { name: 'Ana', actionUrl: 'javascript:alert(1)' }), /http\(s\)/);
  assert.throws(() => overdue(brand, { name: 'Ana', amount: 1, dueDate: '2026-10-01', paymentUrl: 'data:text/html,x' }), /http\(s\)/);
  assert.throws(() => safeUrl('não é url'), TypeError);
  assert.equal(safeUrl('https://exemplo.com/a b'), 'https://exemplo.com/a%20b');
});

test('campos obrigatórios', () => {
  assert.throws(() => pix(brand, { name: 'Ana', amount: 10, dueDate: '2026-10-15' }), /pixCode/);
  assert.throws(() => boleto(brand, { name: 'Ana', amount: 10, dueDate: '2026-10-15' }), /digitableLine/);
});

test('compatibilidade: botão VML no Outlook e preheader oculto', () => {
  const { html } = overdue(brand, { name: 'Ana', amount: 10, dueDate: '2026-10-01', paymentUrl: 'https://pague.exemplo/f/1' });
  assert.ok(html.includes('<v:roundrect'), 'botão VML para Outlook');
  assert.ok(html.includes('href="https://pague.exemplo/f/1"'));
  assert.match(html, /display:none;max-height:0;overflow:hidden[^>]*>Não identificamos o pagamento/);
  assert.ok(html.includes('max-width:600px'));
  assert.ok(html.includes('role="presentation"'));
});

test('partes opcionais aparecem só quando informadas', () => {
  const base = { name: 'Ana', amount: 10, dueDate: '2026-10-15', pixCode: 'X' };
  assert.ok(!pix(brand, base).html.includes('QR Code Pix'));
  assert.ok(pix(brand, { ...base, qrCodeUrl: 'https://qr.exemplo/1.png' }).html.includes('alt="QR Code Pix"'));

  const paid = paymentReceived(brand, { name: 'Ana', amount: 10, paidAt: '2026-10-06T10:00:00Z', method: 'Pix' });
  assert.ok(paid.html.includes('06/10/2026'));
  assert.ok(paid.html.includes('>Pix<'));

  const reset = passwordReset(brand, { name: 'Ana', resetUrl: 'https://a.exemplo/r', expiresInMinutes: 15 });
  assert.ok(reset.html.includes('15 minutos'));
  assert.equal(reset.subject, 'Redefinição de senha — Studio Exemplo');
});

test('boleto sem descrição não deixa espaço solto', () => {
  const { html } = boleto(brand, { name: 'Ana', amount: 10, dueDate: '2026-10-15', digitableLine: '1' });
  assert.ok(html.includes('Segue o boleto.'));
});
