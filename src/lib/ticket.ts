import QRCode from 'qrcode';

export function generatePNR(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars (0, O, 1, I)
  let result = 'BE';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateVerificationCode(seatNumber: string): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `VER-${seatNumber}-${num}`;
}

export async function generateQRCodeDataUrl(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      margin: 1,
      width: 200,
      color: {
        dark: '#0B1F3A',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}
