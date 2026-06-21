<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $sale->sale_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 14px;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            width: 100%;
            margin-bottom: 30px;
        }
        .header td {
            vertical-align: top;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1E4D3A;
            margin-bottom: 5px;
        }
        .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #555;
            text-align: right;
            text-transform: uppercase;
        }
        .details-section {
            width: 100%;
            margin-bottom: 30px;
        }
        .details-section td {
            width: 50%;
            vertical-align: top;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            color: #777;
            margin-bottom: 8px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
        }
        .info-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .info-table th {
            text-align: left;
            padding-right: 15px;
            color: #555;
            font-weight: normal;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background-color: #f8f9fa;
            color: #333;
            font-weight: bold;
            text-align: left;
            padding: 10px;
            border-bottom: 2px solid #ddd;
        }
        .items-table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        .text-right {
            text-align: right !important;
        }
        .text-center {
            text-align: center !important;
        }
        .totals-table {
            width: 40%;
            float: right;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 8px 10px;
        }
        .totals-table tr.grand-total td {
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #333;
            color: #1E4D3A;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #777;
            clear: both;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
    </style>
</head>
<body>

    <table class="header">
        <tr>
            <td>
                <div class="company-name">Phoenix Herbal</div>
                <div>Layanan Konsultasi & Produk Herbal</div>
                <div>Indonesia</div>
            </td>
            <td>
                <div class="invoice-title">INVOICE</div>
                <div style="text-align: right; margin-top: 5px;">
                    <strong>No. Transaksi:</strong> {{ $sale->sale_number }}<br>
                    <strong>Tanggal:</strong> {{ date('d/m/Y', strtotime($sale->sold_at)) }}<br>
                    <strong>Status:</strong> <span style="text-transform: uppercase;">SELESAI (OFFLINE)</span>
                </div>
            </td>
        </tr>
    </table>

    <table class="details-section">
        <tr>
            <td style="padding-right: 20px;">
                <div class="section-title">Pelanggan</div>
                <strong>{{ $sale->customerProfile->name ?? $sale->customer_name ?? 'Pelanggan Umum' }}</strong><br>
                WhatsApp: {{ $sale->customerProfile->whatsapp_number ?? '-' }}<br>
            </td>
            <td>
                <div class="section-title">Detail Penjualan</div>
                <strong>Tipe:</strong> {{ ucfirst(str_replace('_', ' ', $sale->source ?? 'Offline')) }}<br>
                <strong>Kasir / Staff:</strong> {{ $sale->fieldStaff->name ?? auth()->user()->name ?? '-' }}<br>
                <strong>Metode Pembayaran:</strong> {{ $sale->paymentMethod->bank_name ?? ucfirst($sale->paymentMethod->type ?? '-') }}
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 50%;">Produk / Layanan</th>
                <th class="text-center" style="width: 15%;">Jumlah</th>
                <th class="text-right" style="width: 15%;">Harga</th>
                <th class="text-right" style="width: 20%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->offlineSaleItems ?? [] as $item)
            <tr>
                <td>
                    <strong>{{ $item->product->name ?? $item->service->name ?? $item->item_name ?? 'Item' }}</strong>
                </td>
                <td class="text-center">{{ $item->quantity ?? 1 }}</td>
                <td class="text-right">Rp {{ number_format($item->unit_price ?? 0, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($item->line_total ?? (($item->quantity ?? 1) * ($item->unit_price ?? 0)), 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals-table">
        @if(($sale->voucher_discount_amount ?? 0) > 0)
        <tr>
            <td>Subtotal</td>
            <td class="text-right">Rp {{ number_format($sale->subtotal, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Voucher {{ $sale->voucherRedemption?->voucher?->code }}</td>
            <td class="text-right">- Rp {{ number_format($sale->voucher_discount_amount, 0, ',', '.') }}</td>
        </tr>
        @endif
        <tr class="grand-total">
            <td>TOTAL</td>
            <td class="text-right">Rp {{ number_format($sale->total, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div style="clear: both;"></div>

    <div class="footer">
        Terima kasih telah berbelanja di Phoenix Herbal.<br>
        Invoice ini sah dan diproses secara otomatis oleh komputer.
    </div>

</body>
</html>
