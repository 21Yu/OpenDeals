import { Resend } from 'resend';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

export async function sendPriceAlertEmail(
  userEmail: string,
  itemTitle: string,
  oldPrice: number,
  newPrice: number,
  itemUrl: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const url = new URL(itemUrl);

  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY and RESEND_FROM_EMAIL must be configured');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Product URL must use HTTP or HTTPS');
  }

  const safeTitle = escapeHtml(itemTitle);
  const safeUrl = escapeHtml(url.toString());
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: userEmail,
    subject: `Price drop: ${itemTitle}`,
    html: `<h2>A product on your OpenDeals list dropped in price.</h2>
      <p><strong>${safeTitle}</strong> is now $${newPrice.toFixed(2)}, down from $${oldPrice.toFixed(2)}.</p>
      <p><a href="${safeUrl}">View deal</a></p>`,
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message}`);
  }
}