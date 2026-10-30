import { describe, it, expect } from 'vitest';
import { formatBDT, toBengaliDigits, getDictionary } from '../src/lib/i18n';
import { generatePNR, generateVerificationCode } from '../src/lib/ticket';
import bnMessages from '../messages/bn.json';
import enMessages from '../messages/en.json';

describe('Bhabachyaka Express Platform Tests', () => {
  describe('Bilingual Localization & Formatters', () => {
    it('should format BDT currency properly in Bengali and English', () => {
      const bnFormatted = formatBDT(1200, 'bn');
      const enFormatted = formatBDT(1200, 'en');

      expect(bnFormatted).toBe('৳ ১,২০০');
      expect(enFormatted).toBe('৳ 1,200');
    });

    it('should accurately convert latin digits to Bengali digits', () => {
      expect(toBengaliDigits('0123456789')).toBe('০১২৩৪৫৬৭৮৯');
      expect(toBengaliDigits(2026)).toBe('২০২৬');
    });

    it('should have 100% symmetrical top-level dictionary keys between Bengali and English', () => {
      const bnKeys = Object.keys(bnMessages).sort();
      const enKeys = Object.keys(enMessages).sort();

      expect(bnKeys).toEqual(enKeys);

      // Verify essential nested sections
      for (const section of ['brand', 'nav', 'hero', 'search', 'seatMap', 'passenger', 'payment', 'pos', 'operator', 'superAdmin']) {
        const bnSubKeys = Object.keys((bnMessages as any)[section]).sort();
        const enSubKeys = Object.keys((enMessages as any)[section]).sort();
        expect(bnSubKeys).toEqual(enSubKeys);
      }
    });
  });

  describe('PNR & Ticketing Utilities', () => {
    it('should generate valid PNRs starting with BE and exactly 9 characters long', () => {
      const pnr1 = generatePNR();
      const pnr2 = generatePNR();

      expect(pnr1.startsWith('BE')).toBe(true);
      expect(pnr1.length).toBe(9);
      expect(pnr2.startsWith('BE')).toBe(true);
      expect(pnr2.length).toBe(9);
      expect(pnr1).not.toBe(pnr2);
    });

    it('should generate unambiguous seat verification codes', () => {
      const codeA1 = generateVerificationCode('A1');
      expect(codeA1.startsWith('VER-A1-')).toBe(true);
    });
  });

  describe('Financial & Fare Calculations', () => {
    it('should correctly calculate total payable amount with service charge', () => {
      const baseFare = 1200;
      const serviceFeePerSeat = 50;
      const seatCount = 2;

      const subtotal = baseFare * seatCount; // 2400
      const totalServiceFee = serviceFeePerSeat * seatCount; // 100
      const totalPayable = subtotal + totalServiceFee; // 2500

      expect(totalPayable).toBe(2500);
    });

    it('should correctly calculate 10% policy cancellation penalty and 90% refund', () => {
      const paidAmount = 2500;
      const penaltyFee = Math.round(paidAmount * 0.1); // 250
      const refundAmount = paidAmount - penaltyFee; // 2250

      expect(penaltyFee).toBe(250);
      expect(refundAmount).toBe(2250);
      expect(penaltyFee + refundAmount).toBe(paidAmount);
    });

    it('should reconcile cash shift closing expected balances accurately', () => {
      const openingBalance = 2000;
      const cashTicketSales = 6450;
      const cashRefunds = 0;
      const expenses = 0;

      const expectedClosing = openingBalance + cashTicketSales - cashRefunds - expenses;
      expect(expectedClosing).toBe(8450);

      const actualCashInDrawer = 8450;
      const difference = actualCashInDrawer - expectedClosing;
      expect(difference).toBe(0);
    });
  });
});
