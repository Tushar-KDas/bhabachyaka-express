'use client';

import React, { useState } from 'react';
import { ShieldAlert, Compass, CheckCircle2, RotateCcw, X, Info, MapPin, Navigation } from 'lucide-react';
import { getDictionary, Locale, formatBDT, toBengaliDigits } from '@/lib/i18n';

export interface SeatItem {
  id: string;
  seatNumber: string;
  seatClass: string;
  fare: number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
}

export interface CounterChoice {
  id: string;
  name: string;
  time?: string;
}

interface Props {
  locale: Locale;
  seats: SeatItem[];
  layoutType?: string; // '2x2' or '2x1'
  baseFare: number;
  serviceFee?: number;
  distanceKm?: number;
  selectedSeats: string[];
  onSeatToggle: (seatNumber: string) => void;
  onClearSeats?: () => void;
  maxSeats?: number;
  onProceed?: () => void;
  isLoading?: boolean;
  boardingOptions?: CounterChoice[];
  droppingOptions?: CounterChoice[];
  selectedBoarding?: string;
  selectedDropping?: string;
  onBoardingChange?: (counterName: string) => void;
  onDroppingChange?: (counterName: string) => void;
}

export default function SeatMap({
  locale,
  seats,
  layoutType = '2x2',
  baseFare,
  serviceFee = 50,
  distanceKm,
  selectedSeats,
  onSeatToggle,
  onClearSeats,
  maxSeats = 4,
  onProceed,
  isLoading = false,
  boardingOptions = [],
  droppingOptions = [],
  selectedBoarding = '',
  selectedDropping = '',
  onBoardingChange,
  onDroppingChange,
}: Props) {
  const t = getDictionary(locale);
  const [errorNotice, setErrorNotice] = useState('');

  // Group seats by row letter (A, B, C...)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const is2x1 = layoutType === '2x1';

  const handleSeatClick = (seat: SeatItem) => {
    if (seat.status !== 'AVAILABLE' && !selectedSeats.includes(seat.seatNumber)) {
      return;
    }

    if (!selectedSeats.includes(seat.seatNumber) && selectedSeats.length >= maxSeats) {
      setErrorNotice(
        locale === 'bn'
          ? `একবারে সর্বোচ্চ ${toBengaliDigits(maxSeats)}টি সিট নির্বাচন করতে পারবেন।`
          : `You can select up to ${maxSeats} seats at a time.`
      );
      setTimeout(() => setErrorNotice(''), 3500);
      return;
    }

    setErrorNotice('');
    onSeatToggle(seat.seatNumber);
  };

  const selectedCount = selectedSeats.length;
  const subTotal = selectedCount * baseFare;
  const totalServiceFee = selectedCount * serviceFee;
  const grandTotal = subTotal + totalServiceFee;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
        <div>
          <h3 className="font-black text-sm text-[#0B1F3A] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]"></span>
            {locale === 'bn' ? 'সিট নির্বাচন (Seat Selection)' : 'Interactive Seat Selection'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {locale === 'bn'
              ? 'পছন্দের সিটের ওপর ক্লিক করুন (একবারে সর্বোচ্চ ৪টি সিট)'
              : 'Click on an available seat to select (maximum 4 seats)'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#16A34A] border border-emerald-600 shadow-sm"></div>
            <span className="text-slate-600 text-[11px]">{t.seatMap.available}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#FF6B00] border border-orange-600 shadow-sm"></div>
            <span className="text-slate-600 text-[11px]">{t.seatMap.selected}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300"></div>
            <span className="text-slate-400 text-[11px]">{t.seatMap.booked}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-500"></div>
            <span className="text-slate-600 text-[11px]">{t.seatMap.held}</span>
          </div>
        </div>
      </div>

      {errorNotice && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bus Cabin Outline */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-[340px] bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] p-5 shadow-inner relative">
            {/* Front Cabin & Driver */}
            <div className="flex items-center justify-between px-3 pb-3 mb-4 border-b-2 border-dashed border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
              {/* Bus Front Door Entry */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold bg-white px-2 py-1 rounded-md border border-slate-200">
                <span>🚪 {locale === 'bn' ? 'প্রবেশদ্বার' : 'Door'}</span>
              </div>

              {/* Driver Steering Wheel */}
              <div
                className="w-8 h-8 rounded-full border-2 border-slate-400 bg-white flex items-center justify-center text-slate-700 shadow-sm"
                title={t.seatMap.driver}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L11 11.18V18h2v-6.82l5.31-4.08C19.37 8.45 20 10.15 20 12c0 4.41-3.59 8-8 8zm-1-10.82L7.38 6.46C8.71 5.56 10.29 5 12 5s3.29.56 4.62 1.46L13 9.18v-.01h-2z" />
                </svg>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="space-y-2.5">
              {rows.map((rowLetter) => {
                const rowSeats = seats.filter((s) => s.seatNumber.startsWith(rowLetter));
                if (rowSeats.length === 0) return null;

                const leftSeats = is2x1
                  ? rowSeats.filter((s) => s.seatNumber.endsWith('1'))
                  : rowSeats.filter((s) => s.seatNumber.endsWith('1') || s.seatNumber.endsWith('2'));

                const rightSeats = is2x1
                  ? rowSeats.filter((s) => s.seatNumber.endsWith('2') || s.seatNumber.endsWith('3'))
                  : rowSeats.filter((s) => s.seatNumber.endsWith('3') || s.seatNumber.endsWith('4'));

                return (
                  <div key={rowLetter} className="flex items-center justify-between">
                    {/* Left Column(s) */}
                    <div className="flex gap-2">
                      {leftSeats.map((seat) => renderSeatButton(seat))}
                    </div>

                    {/* Aisle */}
                    <div className="text-[10px] font-black text-slate-400 w-6 text-center select-none bg-slate-200/50 py-0.5 rounded">
                      {rowLetter}
                    </div>

                    {/* Right Column(s) */}
                    <div className="flex gap-2">
                      {rightSeats.map((seat) => renderSeatButton(seat))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rear indicator */}
            <div className="pt-3 mt-4 border-t-2 border-dashed border-slate-200 text-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              {t.seatMap.rear}
            </div>
          </div>
        </div>

        {/* Selected Seats & Pricing Summary Card */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h4 className="font-extrabold text-xs text-[#0B1F3A] uppercase tracking-wider">
              {t.seatMap.selectedSeats}
            </h4>
            {selectedCount > 0 && (
              <span className="text-[11px] font-bold text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded">
                {locale === 'bn' ? `${toBengaliDigits(selectedCount)}টি সিট` : `${selectedCount} Seats`}
              </span>
            )}
          </div>

          {selectedCount === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 mx-auto flex items-center justify-center text-slate-300">
                <Info className="w-5 h-5" />
              </div>
              <p>
                {locale === 'bn'
                  ? 'বাসের সিট ম্যাপ থেকে আপনার পছন্দের সিট বেছে নিন।'
                  : 'Select your preferred seats from the bus layout.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected seat chips */}
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF6B00] text-white text-xs font-black rounded-lg shadow-sm"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => onSeatToggle(s)}
                      className="hover:text-slate-200 text-white cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Boarding & Dropping Counter Selection */}
              {(boardingOptions.length > 0 || droppingOptions.length > 0) && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#0B1F3A] flex items-center gap-1.5 pb-1 border-b border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>{locale === 'bn' ? 'কাউন্টার নির্বাচন করুন' : 'Select Boarding & Dropping Points'}</span>
                  </div>

                  {/* Boarding Counter Selection */}
                  {boardingOptions.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{locale === 'bn' ? 'বোর্ডিং কাউন্টার (কোথা থেকে উঠবেন):' : 'Boarding Point (Departure Counter):'}</span>
                      </label>
                      <select
                        value={selectedBoarding}
                        onChange={(e) => onBoardingChange && onBoardingChange(e.target.value)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {boardingOptions.map((opt) => (
                          <option key={opt.id} value={opt.name}>
                            📍 {opt.name} {opt.time ? `(${opt.time})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Dropping Counter Selection */}
                  {droppingOptions.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#FF6B00] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF6B00]"></span>
                        <span>{locale === 'bn' ? 'ড্রপিং কাউন্টার (কোথায় নামবেন):' : 'Dropping Point (Arrival Counter):'}</span>
                      </label>
                      <select
                        value={selectedDropping}
                        onChange={(e) => onDroppingChange && onDroppingChange(e.target.value)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                      >
                        {droppingOptions.map((opt) => (
                          <option key={opt.id} value={opt.name}>
                            🏁 {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Distance Mileage Formula Badge */}
              {distanceKm && (
                <div className="bg-orange-50 border border-orange-200 text-orange-950 p-2.5 rounded-xl text-[11px] font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Navigation className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>{locale === 'bn' ? 'মহাসড়ক দূরত্ব ও রেট:' : 'Distance & Rate:'}</span>
                  </span>
                  <span className="font-black text-[#FF6B00]">
                    {locale === 'bn' ? `${toBengaliDigits(distanceKm)} কি.মি. (প্রতি কি.মি. ৩ টাকা)` : `${distanceKm} km (@ ৳3/km)`}
                  </span>
                </div>
              )}

              {/* Fare calculation breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>
                    {t.seatMap.seatFare} ({locale === 'bn' ? toBengaliDigits(selectedCount) : selectedCount} ×{' '}
                    {formatBDT(baseFare, locale)})
                  </span>
                  <span className="font-bold text-slate-900">{formatBDT(subTotal, locale)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t.seatMap.serviceCharge}</span>
                  <span className="font-bold text-slate-900">{formatBDT(totalServiceFee, locale)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t.seatMap.discount}</span>
                  <span className="font-bold text-[#16A34A]">{formatBDT(0, locale)}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 font-extrabold text-sm text-[#0B1F3A]">
                  <span>{t.seatMap.total}</span>
                  <span className="text-lg text-[#FF6B00] font-black">{formatBDT(grandTotal, locale)}</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2 pt-2">
                {onProceed && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={onProceed}
                    className="w-full py-3 bg-[#16A34A] hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t.seatMap.nextStep}</span>
                      </>
                    )}
                  </button>
                )}

                {onClearSeats && (
                  <button
                    type="button"
                    onClick={onClearSeats}
                    className="w-full py-2 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>{locale === 'bn' ? 'সিট রিসেট করুন' : 'Reset Selection'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderSeatButton(seat: SeatItem) {
    const isSelected = selectedSeats.includes(seat.seatNumber);
    const isBooked = seat.status === 'BOOKED' || seat.status === 'BLOCKED';
    const isHeld = seat.status === 'HELD' && !isSelected;

    let btnStyle = 'bg-[#16A34A] text-white hover:bg-emerald-700 shadow-sm cursor-pointer hover:scale-105';

    if (isSelected) {
      btnStyle = 'bg-[#FF6B00] text-white shadow-md ring-2 ring-orange-400 font-black scale-105';
    } else if (isBooked) {
      btnStyle = 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60';
    } else if (isHeld) {
      btnStyle = 'bg-amber-400 text-slate-900 border border-amber-500 cursor-not-allowed';
    }

    return (
      <button
        key={seat.seatNumber}
        type="button"
        disabled={isBooked || isHeld}
        onClick={() => handleSeatClick(seat)}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${btnStyle}`}
        title={`${seat.seatNumber} - ${formatBDT(seat.fare, locale)}`}
      >
        <span>{seat.seatNumber}</span>
      </button>
    );
  }
}
