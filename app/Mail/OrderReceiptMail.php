<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\HtmlString;

class OrderReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $htmlBody;
    public string $orderNumber;

    /**
     * Create a new message instance.
     */
    public function __construct(string $orderNumber, string $htmlBody)
    {
        $this->orderNumber = $orderNumber;
        $this->htmlBody = $htmlBody;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Struk Penjualan Phoenix Herbal',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.order_receipt',
            with: [
                'orderNumber' => $this->orderNumber,
                'htmlBody' => $this->htmlBody,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
