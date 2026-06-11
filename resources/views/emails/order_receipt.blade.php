<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pesanan Baru - {{ $orderNumber }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f5f7;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        /* Fix for Quill text alignment classes */
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }
        
        .body-content p {
            margin-top: 0;
            margin-bottom: 8px;
        }
    </style>
</head>
<body style="background-color: #f4f5f7; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f5f7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="background-color: #111827; padding: 30px; text-align: left;">
                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 8px; font-family: Arial, sans-serif;">PESANAN BARU</div>
                            <div style="font-size: 26px; font-weight: bold; color: #ffffff; margin: 0; font-family: Arial, sans-serif;">{{ $orderNumber }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td class="body-content" style="padding: 30px; color: #374151; line-height: 1.6; font-size: 15px; font-family: Arial, sans-serif; text-align: left;">
                            {!! $htmlBody !!}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
