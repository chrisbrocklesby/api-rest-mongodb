import postmark from 'postmark';

export default async ({
  from, to, subject, text, html,
}) => {
  const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
  return client.sendEmail({
    From: from || process.env.POSTMARK_FROM,
    To: to || '',
    Subject: subject || '',
    TextBody: text || '',
    HtmlBody: html || '',
  });
};
