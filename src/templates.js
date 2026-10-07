import { esc, safeUrl, required, layout, button, paragraph, small, summary, codeBox } from './layout.js';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = (v) => brl.format(v).replace(/\s/g, ' ');
const dateBR = (iso) => String(iso).slice(0, 10).split('-').reverse().join('/');
const firstName = (name) => String(name).trim().split(/\s+/)[0];

/** Cada template devolve { subject, html, text }: sempre envie a versão em texto junto. */
function render(brand, { title, subject, preheader, blocks, text }) {
  return {
    // Quebra de linha no assunto pode injetar cabeçalhos em envios por SMTP
    subject: subject.replace(/[\r\n]+/g, ' ').trim(),
    html: layout({ brand, title, preheader, content: blocks.join('\n') }),
    text: [...text, '', '—', brand.name, brand.supportEmail ?? ''].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n').trim(),
  };
}

const color = (brand) => brand.color ?? '#2563eb';
const h1 = (s) => `<h1 style="margin:0 0 16px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:24px;line-height:1.3;color:#0f172a">${s}</h1>`;

export function welcome(brand, d) {
  required(d, ['name', 'actionUrl'], 'welcome');
  return render(brand, {
    subject: `Bem-vindo(a) à ${brand.name}, ${firstName(d.name)}!`,
    title: 'Boas-vindas',
    preheader: 'Sua conta está pronta. Veja como começar em poucos minutos.',
    blocks: [
      h1(`Olá, ${esc(firstName(d.name))}! 👋`),
      paragraph(`Sua conta na <strong>${esc(brand.name)}</strong> está pronta. ${d.intro ? esc(d.intro) : 'Leva poucos minutos para deixar tudo configurado.'}`),
      button(d.actionLabel ?? 'Acessar minha conta', d.actionUrl, color(brand)),
      small('Se você não criou esta conta, pode ignorar este e-mail.'),
    ],
    text: [`Olá, ${firstName(d.name)}!`, `Sua conta na ${brand.name} está pronta.`, '', `Acesse: ${safeUrl(d.actionUrl)}`],
  });
}

export function pix(brand, d) {
  required(d, ['name', 'amount', 'dueDate', 'pixCode'], 'pix');
  const blocks = [
    h1('Seu Pix está pronto'),
    paragraph(`Olá, ${esc(firstName(d.name))}. Para concluir ${d.description ? `<strong>${esc(d.description)}</strong>` : 'seu pagamento'}, use o código Pix abaixo no app do seu banco.`),
    summary([['Valor', money(d.amount), true], ['Vencimento', dateBR(d.dueDate)]]),
  ];
  if (d.qrCodeUrl) {
    blocks.push(`<p style="margin:0 0 16px;text-align:center"><img src="${esc(safeUrl(d.qrCodeUrl, 'qrCodeUrl'))}" width="200" height="200" alt="QR Code Pix" style="border:0;display:inline-block"></p>`);
  }
  blocks.push(codeBox('Pix copia e cola', d.pixCode));
  if (d.paymentUrl) blocks.push(button('Abrir página de pagamento', d.paymentUrl, color(brand)));
  blocks.push(small('A confirmação do Pix é automática e costuma levar poucos segundos.'));
  return render(brand, {
    subject: `Pix de ${money(d.amount)} — vence em ${dateBR(d.dueDate)}`,
    title: 'Pagamento via Pix',
    preheader: `Copie o código Pix de ${money(d.amount)} e pague pelo app do seu banco.`,
    blocks,
    text: [`Olá, ${firstName(d.name)}.`, `Valor: ${money(d.amount)} — vencimento ${dateBR(d.dueDate)}`, '', 'Pix copia e cola:', d.pixCode,
      ...(d.paymentUrl ? ['', `Página de pagamento: ${safeUrl(d.paymentUrl)}`] : [])],
  });
}

export function boleto(brand, d) {
  required(d, ['name', 'amount', 'dueDate', 'digitableLine'], 'boleto');
  const blocks = [
    h1('Seu boleto chegou'),
    paragraph(`Olá, ${esc(firstName(d.name))}. Segue o boleto${d.description ? ` de <strong>${esc(d.description)}</strong>` : ''}.`),
    summary([['Valor', money(d.amount), true], ['Vencimento', dateBR(d.dueDate)]]),
    codeBox('Linha digitável', d.digitableLine),
  ];
  if (d.pdfUrl) blocks.push(button('Baixar boleto (PDF)', d.pdfUrl, color(brand)));
  blocks.push(small('O pagamento de boleto leva até 3 dias úteis para ser compensado.'));
  return render(brand, {
    subject: `Boleto de ${money(d.amount)} — vence em ${dateBR(d.dueDate)}`,
    title: 'Boleto',
    preheader: `Boleto de ${money(d.amount)} com vencimento em ${dateBR(d.dueDate)}.`,
    blocks,
    text: [`Olá, ${firstName(d.name)}.`, `Valor: ${money(d.amount)} — vencimento ${dateBR(d.dueDate)}`, '', 'Linha digitável:', d.digitableLine,
      ...(d.pdfUrl ? ['', `PDF: ${safeUrl(d.pdfUrl)}`] : [])],
  });
}

export function paymentReceived(brand, d) {
  required(d, ['name', 'amount', 'paidAt'], 'paymentReceived');
  const blocks = [
    h1('Pagamento confirmado ✅'),
    paragraph(`Obrigado, ${esc(firstName(d.name))}! Recebemos seu pagamento${d.description ? ` de <strong>${esc(d.description)}</strong>` : ''}.`),
    summary([['Valor pago', money(d.amount), true], ['Data', dateBR(d.paidAt)], ...(d.method ? [['Forma', d.method]] : [])]),
  ];
  if (d.receiptUrl) blocks.push(button('Ver recibo', d.receiptUrl, color(brand)));
  return render(brand, {
    subject: `Pagamento de ${money(d.amount)} confirmado`,
    title: 'Pagamento confirmado',
    preheader: `Recebemos ${money(d.amount)} em ${dateBR(d.paidAt)}. Obrigado!`,
    blocks,
    text: [`Obrigado, ${firstName(d.name)}!`, `Recebemos ${money(d.amount)} em ${dateBR(d.paidAt)}.`,
      ...(d.receiptUrl ? ['', `Recibo: ${safeUrl(d.receiptUrl)}`] : [])],
  });
}

export function overdue(brand, d) {
  required(d, ['name', 'amount', 'dueDate', 'paymentUrl'], 'overdue');
  const days = d.daysLate ?? null;
  return render(brand, {
    subject: `Fatura de ${money(d.amount)} em aberto`,
    title: 'Fatura em aberto',
    preheader: 'Não identificamos o pagamento. Regularize em poucos cliques.',
    blocks: [
      h1('Não identificamos seu pagamento'),
      paragraph(`Olá, ${esc(firstName(d.name))}. A fatura${d.description ? ` de <strong>${esc(d.description)}</strong>` : ''} venceu em ${esc(dateBR(d.dueDate))}${days ? ` (há ${esc(days)} dia${days === 1 ? '' : 's'})` : ''} e ainda está em aberto.`),
      summary([['Valor', money(d.amount), true], ['Vencimento', dateBR(d.dueDate)]]),
      button('Pagar agora', d.paymentUrl, color(brand)),
      small(d.suspensionDate
        ? `Para evitar a suspensão do serviço em ${esc(dateBR(d.suspensionDate))}, regularize até essa data. Se você já pagou, desconsidere este aviso.`
        : 'Se você já pagou, desconsidere este aviso: a compensação pode levar até 3 dias úteis.'),
    ],
    text: [`Olá, ${firstName(d.name)}.`, `A fatura de ${money(d.amount)} venceu em ${dateBR(d.dueDate)} e está em aberto.`, '', `Pague em: ${safeUrl(d.paymentUrl)}`],
  });
}

export function passwordReset(brand, d) {
  required(d, ['name', 'resetUrl'], 'passwordReset');
  const minutes = d.expiresInMinutes ?? 30;
  return render(brand, {
    subject: `Redefinição de senha — ${brand.name}`,
    title: 'Redefinir senha',
    preheader: `Link válido por ${minutes} minutos.`,
    blocks: [
      h1('Redefinir sua senha'),
      paragraph(`Olá, ${esc(firstName(d.name))}. Recebemos um pedido para redefinir a senha da sua conta.`),
      button('Criar nova senha', d.resetUrl, color(brand)),
      small(`O link vale por <strong>${esc(minutes)} minutos</strong> e só pode ser usado uma vez.`),
      small(`Não foi você? Ignore este e-mail: sua senha continua a mesma.${d.ip ? ` Pedido feito do IP ${esc(d.ip)}.` : ''}`),
    ],
    text: [`Olá, ${firstName(d.name)}.`, 'Para criar uma nova senha, acesse:', safeUrl(d.resetUrl), '', `O link vale por ${minutes} minutos. Não foi você? Ignore este e-mail.`],
  });
}

export const TEMPLATES = { welcome, pix, boleto, paymentReceived, overdue, passwordReset };
