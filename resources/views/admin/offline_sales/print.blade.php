<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk Penjualan - {{ $sale->sale_number }}</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            margin: 0;
            padding: 0;
            color: #000;
        }
        .ticket {
            width: 58mm; /* Ukuran thermal standard (58mm) */
            max-width: 58mm;
            margin: 0 auto;
            padding: 5px;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .text-left {
            text-align: left;
        }
        .font-bold {
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td, th {
            padding: 2px 0;
            vertical-align: top;
        }
        .divider {
            border-top: 1px dashed #000;
            margin: 5px 0;
        }
        .item-name {
            font-size: 11px;
            display: block;
            margin-bottom: 2px;
        }
        .item-qty-price {
            font-size: 11px;
        }
        @media print {
            body {
                width: 58mm;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body onload="window.print();">
    <div class="no-print" style="text-align: center; margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">Print Ulang</button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">Tutup Tab</button>
    </div>

    <div class="ticket">
        <div class="text-center">
            <h2 style="margin: 0; font-size: 16px;">Phoenix Herbal</h2>
            <p style="margin: 2px 0; font-size: 10px;">Struk Penjualan</p>
        </div>

        <div class="divider"></div>

        <div>
            <table style="font-size: 11px;">
                <tr>
                    <td style="width: 40%">No. Nota</td>
                    <td style="width: 60%">: {{ $sale->sale_number }}</td>
                </tr>
                <tr>
                    <td>Tanggal</td>
                    <td>: {{ date('d-m-Y H:i', strtotime($sale->sold_at)) }}</td>
                </tr>
                <tr>
                    <td>Pelanggan</td>
                    <td>: {{ $sale->customer_name ?: 'Umum' }}</td>
                </tr>
                <tr>
                    <td>Kasir</td>
                    <td>: {{ auth()->user()->name }}</td>
                </tr>
            </table>
        </div>

        <div class="divider"></div>

        <table>
            @foreach($sale->offlineSaleItems as $item)
            <tr>
                <td colspan="3">
                    <span class="item-name">{{ $item->item_name ?: ($item->product?->name ?: $item->service?->name) }}</span>
                </td>
            </tr>
            <tr class="item-qty-price">
                <td style="width: 30%">{{ $item->quantity }} x</td>
                <td style="width: 35%" class="text-right">{{ number_format($item->unit_price, 0, ',', '.') }}</td>
                <td style="width: 35%" class="text-right">{{ number_format($item->line_total, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </table>

        <div class="divider"></div>

        <table>
            <tr>
                <td class="font-bold text-left">TOTAL</td>
                <td class="font-bold text-right">Rp {{ number_format($sale->total, 0, ',', '.') }}</td>
            </tr>
            @if($sale->paymentMethod)
            <tr>
                <td class="text-left" style="font-size: 10px;">Pembayaran</td>
                <td class="text-right" style="font-size: 10px;">{{ $sale->paymentMethod->bank_name ?: ucfirst($sale->paymentMethod->type) }}</td>
            </tr>
            @endif
        </table>

        <div class="divider"></div>

        <div class="text-center" style="font-size: 10px; margin-top: 10px;">
            <p style="margin: 0;">Terima Kasih</p>
            <p style="margin: 0;">Barang yang sudah dibeli</p>
            <p style="margin: 0;">tidak dapat dikembalikan.</p>
        </div>
    </div>
</body>
</html>
