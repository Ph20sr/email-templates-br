# email-templates-br

[![CI](https://github.com/Ph20sr/email-templates-br/actions/workflows/ci.yml/badge.svg)](https://github.com/Ph20sr/email-templates-br/actions/workflows/ci.yml)
![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![license](https://img.shields.io/badge/license-MIT-blue)

E-mails transacionais em português, prontos para **SaaS, lojas e sistemas de cobrança**, que funcionam onde e-mail costuma quebrar: **Outlook para Windows, Gmail, Apple Mail e celular**. Não têm dependências e funcionam com qualquer serviço de envio (SES, Resend, SendGrid, SMTP).

| template | quando usar |
| --- | --- |
| `welcome` | conta criada |
| `pix` | cobrança Pix, com valor, vencimento, **copia e cola** e QR Code opcional |
| `boleto` | boleto com **linha digitável** e link para o PDF |
| `paymentReceived` | pagamento confirmado, com link para o recibo |
| `overdue` | fatura em aberto, com data de suspensão opcional |
| `passwordReset` | redefinição de senha, com validade e IP do pedido |

## Uso

```js
import { pix } from 'email-templates-br';

const brand = {
  name: 'Sua Empresa',
  color: '#4f46e5',
  logoUrl: 'https://suaempresa.com.br/logo-email.png',  // opcional
  supportEmail: 'suporte@suaempresa.com.br',
  address: 'Sua Empresa Ltda. · São Paulo, SP',
};

const { subject, html, text } = pix(brand, {
  name: 'Maria Souza',
  amount: 149.9,
  dueDate: '2026-10-15',
  description: 'Plano Pro — outubro',
  pixCode: copiaECola,            // ex.: do asaas-php ou do pix-brcode
  paymentUrl: 'https://pague.suaempresa.com.br/f/123',
});
// subject: 'Pix de R$ 149,90 — vence em 15/10/2026'

await resend.emails.send({ from: 'Sua Empresa <cobranca@suaempresa.com.br>', to, subject, html, text });
```

Envie **sempre o `text` junto com o `html`**. Isso melhora a entrega e é o que aparece em leitores sem HTML.

## Como a compatibilidade é garantida

- Layout em **tabelas** com estilos **inline**, porque o Gmail remove `<style>` e o Outlook ignora flexbox e grid
- **Botão com VML** dentro de comentário condicional, a única forma de botão com cantos arredondados e área clicável inteira no Outlook para Windows
- Largura máxima de 600 px, que se ajusta sozinha no celular
- **Preheader**: o texto que aparece ao lado do assunto na caixa de entrada, oculto no corpo
- Caixa de "copia e cola" que quebra códigos longos sem estourar a largura

## Segurança

- **Todo dado do cliente é escapado** (nome, descrição...), sem injeção de HTML
- **Links só `http(s)`**: `javascript:` e `data:` são rejeitados com erro
- **Assunto sem quebras de linha**, sem injeção de cabeçalhos em envios por SMTP
- Campos obrigatórios conferidos: nunca sai um e-mail de Pix sem o código

## Prévia

```bash
npm run preview   # gera preview/index.html com todos os templates e abre em http://localhost:5173
```

## Desenvolvimento

```bash
npm test
```

## Licença

MIT
