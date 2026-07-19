import { Fragment, useEffect, useMemo, useState } from 'react';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

const WEEKDAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function toDateString(date) {
    if (!date) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function parseDateString(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day);

    if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a, b) {
    if (!a || !b) {
        return false;
    }

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isBeforeDay(a, b) {
    return startOfDay(a).getTime() < startOfDay(b).getTime();
}

function isWithinRange(date, start, end) {
    if (!start || !end) {
        return false;
    }

    const time = startOfDay(date).getTime();
    const startTime = startOfDay(start).getTime();
    const endTime = startOfDay(end).getTime();

    return time > startTime && time < endTime;
}

function formatDisplayRange(startDate, endDate) {
    const formatter = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    const start = parseDateString(startDate);
    const end = parseDateString(endDate);

    if (!start && !end) {
        return 'Pilih tanggal A – B';
    }

    if (start && !end) {
        return `${formatter.format(start)} – …`;
    }

    if (!start && end) {
        return `… – ${formatter.format(end)}`;
    }

    if (isSameDay(start, end)) {
        return formatter.format(start);
    }

    return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function buildCalendarDays(monthAnchor) {
    const year = monthAnchor.getFullYear();
    const month = monthAnchor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // Monday-first offset: Sun=0 → 6, Mon=1 → 0, ...
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);

        return {
            date,
            key: toDateString(date),
            inCurrentMonth: date.getMonth() === month,
        };
    });
}

function monthLabel(date) {
    return new Intl.DateTimeFormat('id-ID', {
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function DateRangePicker({
    startDate = null,
    endDate = null,
    onChange,
    disabled = false,
    className = '',
}) {
    const selectedStart = parseDateString(startDate);
    const selectedEnd = parseDateString(endDate);

    const [draftStart, setDraftStart] = useState(selectedStart);
    const [draftEnd, setDraftEnd] = useState(selectedEnd);
    const [hoverDate, setHoverDate] = useState(null);
    const [viewMonth, setViewMonth] = useState(() => {
        if (selectedStart) {
            return new Date(selectedStart.getFullYear(), selectedStart.getMonth(), 1);
        }

        const today = new Date();

        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    useEffect(() => {
        setDraftStart(selectedStart);
        setDraftEnd(selectedEnd);

        if (selectedStart) {
            setViewMonth(new Date(selectedStart.getFullYear(), selectedStart.getMonth(), 1));
        }
    }, [startDate, endDate]);

    const calendarDays = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);

    const previewEnd = draftEnd ?? hoverDate;
    const rangeStart = draftStart && previewEnd
        ? (isBeforeDay(previewEnd, draftStart) ? previewEnd : draftStart)
        : draftStart;
    const rangeEnd = draftStart && previewEnd
        ? (isBeforeDay(previewEnd, draftStart) ? draftStart : previewEnd)
        : draftEnd;

    const displayLabel = formatDisplayRange(startDate, endDate);
    const hasValue = Boolean(startDate || endDate);

    const commitRange = (start, end) => {
        if (!onChange) {
            return;
        }

        onChange({
            start_date: start ? toDateString(start) : null,
            end_date: end ? toDateString(end) : null,
        });
    };

    const handleDayClick = (date) => {
        if (!draftStart || (draftStart && draftEnd)) {
            setDraftStart(date);
            setDraftEnd(null);
            setHoverDate(null);
            return;
        }

        let nextStart = draftStart;
        let nextEnd = date;

        if (isBeforeDay(date, draftStart)) {
            nextStart = date;
            nextEnd = draftStart;
        }

        setDraftStart(nextStart);
        setDraftEnd(nextEnd);
        setHoverDate(null);
        commitRange(nextStart, nextEnd);
    };

    const handleClear = (close) => {
        setDraftStart(null);
        setDraftEnd(null);
        setHoverDate(null);
        commitRange(null, null);
        close();
    };

    const applyPreset = (preset, close) => {
        const today = startOfDay(new Date());
        let start = today;
        let end = today;

        if (preset === 'last_7_days') {
            start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
        } else if (preset === 'month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }

        setDraftStart(start);
        setDraftEnd(end);
        setHoverDate(null);
        setViewMonth(new Date(start.getFullYear(), start.getMonth(), 1));
        commitRange(start, end);
        close();
    };

    return (
        <Popover className={`relative ${className}`}>
            {({ close }) => (
                <>
                    <PopoverButton
                        disabled={disabled}
                        className={`inline-flex h-[42px] w-full items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-left font-body-sm text-sm shadow-sm transition focus:border-[#1E4D3A] focus:outline-none focus:ring-1 focus:ring-[#1E4D3A] disabled:cursor-not-allowed disabled:opacity-60 ${
                            hasValue ? 'font-bold text-[#1E4D3A]' : 'font-medium text-gray-500'
                        }`}
                    >
                        <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-[#1E4D3A]" />
                        <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
                        {hasValue ? (
                            <span
                                role="button"
                                tabIndex={0}
                                aria-label="Hapus periode"
                                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-[#F6F7F7] hover:text-[#1E4D3A]"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleClear(close);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        handleClear(close);
                                    }
                                }}
                            >
                                <X aria-hidden="true" className="h-3.5 w-3.5" />
                            </span>
                        ) : null}
                    </PopoverButton>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-150"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <PopoverPanel className="absolute left-0 z-40 mt-2 w-[min(100vw-2rem,20rem)] rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-xl shadow-[#1E4D3A]/10 sm:w-[22rem]">
                            <div className="mb-3 flex flex-wrap gap-1.5">
                                {[
                                    { id: 'today', label: 'Hari ini' },
                                    { id: 'last_7_days', label: '7 hari' },
                                    { id: 'month', label: 'Bulan ini' },
                                ].map((preset) => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => applyPreset(preset.id, close)}
                                        className="rounded-full border border-[#E5E7EB] bg-[#F6F7F7] px-2.5 py-1 font-body-sm text-[11px] font-bold text-gray-600 transition hover:border-[#A8C5B3] hover:text-[#1E4D3A]"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mb-2 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    aria-label="Bulan sebelumnya"
                                    onClick={() =>
                                        setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
                                    }
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-gray-500 transition hover:border-[#A8C5B3] hover:text-[#1E4D3A]"
                                >
                                    <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                                </button>
                                <p className="font-body-sm text-sm font-extrabold capitalize text-[#333333]">
                                    {monthLabel(viewMonth)}
                                </p>
                                <button
                                    type="button"
                                    aria-label="Bulan berikutnya"
                                    onClick={() =>
                                        setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
                                    }
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-gray-500 transition hover:border-[#A8C5B3] hover:text-[#1E4D3A]"
                                >
                                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mb-1 grid grid-cols-7 gap-0.5">
                                {WEEKDAY_LABELS.map((label) => (
                                    <div
                                        key={label}
                                        className="py-1 text-center font-label-sm text-[10px] font-bold uppercase tracking-wide text-gray-400"
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-0.5">
                                {calendarDays.map(({ date, key, inCurrentMonth }) => {
                                    const isStart = rangeStart && isSameDay(date, rangeStart);
                                    const isEnd = rangeEnd && isSameDay(date, rangeEnd);
                                    const inRange = isWithinRange(date, rangeStart, rangeEnd);
                                    const isSelected = isStart || isEnd;
                                    const isToday = isSameDay(date, new Date());

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleDayClick(date)}
                                            onMouseEnter={() => {
                                                if (draftStart && !draftEnd) {
                                                    setHoverDate(date);
                                                }
                                            }}
                                            onMouseLeave={() => setHoverDate(null)}
                                            className={[
                                                'relative h-9 w-full rounded-lg font-body-sm text-xs font-bold transition',
                                                !inCurrentMonth ? 'text-gray-300' : 'text-gray-700',
                                                inRange && !isSelected ? 'bg-[#1E4D3A]/10 text-[#1E4D3A]' : '',
                                                isSelected ? 'bg-[#1E4D3A] text-white shadow-sm' : '',
                                                !isSelected && inCurrentMonth ? 'hover:bg-[#A8C5B3]/30 hover:text-[#1E4D3A]' : '',
                                                isToday && !isSelected ? 'ring-1 ring-[#A8C5B3]' : '',
                                            ].join(' ')}
                                        >
                                            {date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#E5E7EB] pt-3">
                                <p className="min-w-0 flex-1 truncate font-body-sm text-[11px] font-medium text-gray-500">
                                    {!draftStart
                                        ? 'Klik tanggal mulai'
                                        : !draftEnd
                                            ? 'Klik tanggal akhir'
                                            : formatDisplayRange(toDateString(draftStart), toDateString(draftEnd))}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleClear(close)}
                                    className="shrink-0 rounded-lg px-2 py-1 font-body-sm text-[11px] font-bold text-gray-500 transition hover:bg-[#F6F7F7] hover:text-[#1E4D3A]"
                                >
                                    Hapus
                                </button>
                            </div>
                        </PopoverPanel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}

export default DateRangePicker;
