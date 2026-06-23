<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Phoenix</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; color: #333; font-size: 12px; margin: 24px; }
        h1 { color: #1E4D3A; margin-bottom: 4px; }
        h2 { color: #1E4D3A; margin-top: 24px; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background: #f6f7f7; color: #555; }
        .grid { width: 100%; margin-top: 18px; }
        .metric { width: 24%; display: inline-block; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; margin-right: 1%; margin-bottom: 8px; vertical-align: top; }
        .label { color: #666; font-size: 10px; text-transform: uppercase; }
        .value { color: #1E4D3A; font-size: 16px; font-weight: bold; margin-top: 4px; }
    </style>
</head>
<body>
    <h1>Laporan Phoenix Kantor Pusat</h1>
    <p>Periode: {{ $period['start_date'] }} s/d {{ $period['end_date'] }}</p>

    @php
        $kpiLabels = [
            'websiteOrderRevenue' => 'Pendapatan Order Website',
            'offlineSalesRevenue' => 'Pendapatan Penjualan Offline',
            'totalRevenue' => 'Total Pendapatan',
            'totalLeads' => 'Total Lead',
            'totalBookings' => 'Total Booking',
            'totalOrders' => 'Total Order',
            'totalFieldActivities' => 'Aktivitas Lapangan',
            'totalProductRecommendations' => 'Rekomendasi Produk',
        ];

        $segmentLabels = [
            'leadsBySource' => 'Lead Berdasarkan Sumber',
            'leadsByAssignedStaff' => 'Lead Berdasarkan Staff',
            'bookingsByService' => 'Booking Berdasarkan Layanan',
            'bookingsByStatus' => 'Booking Berdasarkan Status',
            'ordersByStatus' => 'Order Berdasarkan Status',
            'fieldActivitiesByType' => 'Aktivitas Lapangan Berdasarkan Jenis',
            'productRecommendationsByProduct' => 'Rekomendasi Produk Berdasarkan Produk',
            'productStockAndSales' => 'Stok & Penjualan Produk',
        ];

        $readable = fn ($value) => ucwords(str_replace(['_', '-'], ' ', (string) $value));
    @endphp

    <div class="grid">
        @foreach($reports['kpis'] as $label => $value)
            <div class="metric">
                <div class="label">{{ $kpiLabels[$label] ?? str_replace('_', ' ', $label) }}</div>
                <div class="value">{{ is_numeric($value) ? number_format((float) $value, 0, ',', '.') : $value }}</div>
            </div>
        @endforeach
    </div>

    @foreach($reports['segments'] as $segmentName => $rows)
        <h2>{{ $segmentLabels[$segmentName] ?? $readable($segmentName) }}</h2>
        <table>
            <thead>
                <tr>
                    <th>Nama / Status</th>
                    <th>Keterangan</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @forelse($rows as $row)
                    <tr>
                        <td>{{ $row['name'] ?? (isset($row['status']) ? $readable($row['status']) : (isset($row['activityType']) ? $readable($row['activityType']) : '-')) }}</td>
                        <td>{{ $row['email'] ?? $row['slug'] ?? '' }}</td>
                        <td>{{ number_format((int) ($row['total'] ?? 0), 0, ',', '.') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="3">Tidak ada data.</td></tr>
                @endforelse
            </tbody>
        </table>
    @endforeach
</body>
</html>
