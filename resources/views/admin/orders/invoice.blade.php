<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->order_number }}</title>
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
                    @php
                        $statusLabels = [
                            'pending' => 'Pending',
                            'processing' => 'Diproses',
                            'shipped' => 'Dikirim',
                            'completed' => 'Selesai',
                            'cancelled' => 'Dibatalkan',
                        ];
                        $statusText = $statusLabels[$order->status] ?? ucfirst($order->status);
                    @endphp
                    <strong>No. Order:</strong> {{ $order->order_number }}<br>
                    <strong>Tanggal:</strong> {{ $order->created_at->format('d/m/Y') }}<br>
                    <strong>Status:</strong> <span style="text-transform: uppercase;">{{ $statusText }}</span>
                </div>
            </td>
        </tr>
    </table>

    <table class="details-section">
        <tr>
            <td style="padding-right: 20px;">
                <div class="section-title">Ditagihkan Kepada</div>
                <strong>{{ $order->customerProfile->name ?? $order->customer_name ?? $order->user->name ?? 'Customer' }}</strong><br>
                WhatsApp: {{ $order->customer_whatsapp_number ?? $order->customerProfile->whatsapp_number ?? '-' }}<br>
                Email: {{ $order->user->email ?? '-' }}
            </td>
            <td>
                <div class="section-title">Pengiriman Ke</div>
                <strong>{{ $order->customerProfile->name ?? $order->customer_name ?? $order->user->name ?? 'Customer' }}</strong><br>
                {!! nl2br(e($order->shipping_address ?? '-')) !!}<br><br>
                <strong>Kurir:</strong> {{ $order->courier_name ?? '-' }}
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
            @foreach($order->orderItems ?? [] as $item)
            <tr>
                <td>
                    <strong>{{ $item->product->name ?? $item->product_name ?? $item->name ?? 'Item' }}</strong>
                </td>
                <td class="text-center">{{ $item->quantity ?? $item->qty ?? 1 }}</td>
                <td class="text-right">Rp {{ number_format($item->unit_price ?? $item->price ?? 0, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format(($item->quantity ?? $item->qty ?? 1) * ($item->unit_price ?? $item->price ?? 0), 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals-table">
        <tr>
            <td>Subtotal</td>
            <td class="text-right">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Diskon Voucher</td>
            <td class="text-right">- Rp {{ number_format($order->voucher_discount_amount ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Ongkos Kirim</td>
            <td class="text-right">Rp {{ number_format($order->shipping_cost ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr class="grand-total">
            <td>TOTAL</td>
            <td class="text-right">Rp {{ number_format($order->total, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div style="clear: both;"></div>

    <div class="footer">
        Terima kasih telah berbelanja di Phoenix Herbal.<br>
        Invoice ini sah dan diproses secara otomatis oleh komputer.
    </div>

</body>
</html>
