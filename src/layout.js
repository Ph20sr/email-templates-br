// Layout de e-mail compatível com Gmail, Outlook (Windows/Web), Apple Mail e celular:
// tabelas, estilos inline, largura máxima de 600px e botão com VML para o Outlook.

export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

/** Só aceita http(s): impede links javascript: ou data: vindos de dados do usuário. */
export function safeUrl(url, field = 'url') {
  let parsed;
  try {
    parsed = new URL(String(url));
  } catch {
    throw new TypeError(`${field} inválida: ${url}`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new TypeError(`${field} precisa ser http(s): ${url}`);
  return parsed.href;
}

export function required(data, fields, template) {
  for (const f of fields) {
    if (data[f] === undefined || data[f] === null || data[f] === '') {
      throw new TypeError(`Template "${template}": campo obrigatório ausente: ${f}`);
    }
  }
}

const FONT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Botão que funciona até no Outlook para Windows (VML). */
export function button(label, url, color) {
  const href = esc(safeUrl(url, 'link do botão'));
  const text = esc(label);
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0">
  <tr><td align="center" bgcolor="${color}" style="border-radius:8px">
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:46px;v-text-anchor:middle;width:260px" arcsize="17%" stroke="f" fillcolor="${color}">
      <w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold">${text}</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-- -->
    <a href="${href}" target="_blank" style="display:inline-block;padding:13px 28px;font-family:${FONT};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background:${color}">${text}</a>
    <!--<![endif]-->
  </td></tr>
</table>`;
}

export const paragraph = (html) => `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.6;color:#334155">${html}</p>`;
export const small = (html) => `<p style="margin:0 0 12px;font-family:${FONT};font-size:13px;line-height:1.5;color:#64748b">${html}</p>`;

/** Caixa de destaque com linhas rótulo/valor (valor, vencimento...). */
export function summary(rows) {
  const body = rows.map(([label, value, strong]) => `
    <tr>
      <td style="padding:8px 0;font-family:${FONT};font-size:14px;color:#64748b">${esc(label)}</td>
      <td align="right" style="padding:8px 0;font-family:${FONT};font-size:${strong ? 20 : 15}px;font-weight:${strong ? 700 : 600};color:#0f172a">${esc(value)}</td>
    </tr>`).join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
  <tr><td style="padding:12px 20px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${body}</table></td></tr>
</table>`;
}

/** Bloco de código copiável (Pix copia e cola, linha digitável). */
export function codeBox(label, code) {
  return `<p style="margin:0 0 6px;font-family:${FONT};font-size:13px;font-weight:600;color:#475569">${esc(label)}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px">
  <tr><td style="padding:14px 16px;background:#f1f5f9;border:1px dashed #94a3b8;border-radius:8px;font-family:Consolas,'Courier New',monospace;font-size:13px;line-height:1.5;color:#0f172a;word-break:break-all">${esc(code)}</td></tr>
</table>`;
}

/**
 * Envolve o conteúdo no layout completo.
 *
 * @param {object} o
 * @param {string} o.content   HTML do corpo (já escapado)
 * @param {string} o.preheader texto que aparece ao lado do assunto na caixa de entrada
 * @param {{ name: string, color?: string, logoUrl?: string, address?: string, supportEmail?: string }} o.brand
 */
export function layout({ content, preheader, brand, title }) {
  const color = brand.color ?? '#2563eb';
  const logo = brand.logoUrl
    ? `<img src="${esc(safeUrl(brand.logoUrl, 'logoUrl'))}" alt="${esc(brand.name)}" height="36" style="display:block;border:0;height:36px">`
    : `<span style="font-family:${FONT};font-size:20px;font-weight:700;color:#0f172a">${esc(brand.name)}</span>`;
  const footer = [
    brand.supportEmail ? `Dúvidas? Responda este e-mail ou escreva para <a href="mailto:${esc(brand.supportEmail)}" style="color:#64748b">${esc(brand.supportEmail)}</a>.` : '',
    brand.address ? esc(brand.address) : '',
  ].filter(Boolean).join('<br>');

  return `<!doctype html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f1f5f9;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(preheader)}${'&#847;&zwnj;&nbsp;'.repeat(30)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1f5f9">
  <tr><td align="center" style="padding:32px 12px">
    <!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px">
      <tr><td style="padding:0 8px 20px">${logo}</td></tr>
      <tr><td style="background:#ffffff;border-radius:14px;border-top:4px solid ${color};padding:32px 32px 16px">
        ${content}
      </td></tr>
      <tr><td style="padding:20px 8px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:#64748b">
        ${footer}
      </td></tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->
  </td></tr>
</table>
</body>
</html>`;
}
