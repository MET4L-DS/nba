<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/../utils/PHPMailer/Exception.php';
require_once __DIR__ . '/../utils/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../utils/PHPMailer/SMTP.php';

/**
 * Email Service
 * Handles sending system emails via SMTP using PHPMailer
 */
class EmailService
{
    /**
     * Send email using PHPMailer
     * @param string $toEmail Target email address
     * @param string $subject Subject of the email
     * @param string $bodyHTML HTML content of the email
     * @param string $bodyPlain Plain text fallback (optional)
     * @return bool
     * @throws Exception
     */
    public static function sendMail($toEmail, $subject, $bodyHTML, $bodyPlain = '')
    {
        $mail = new PHPMailer(true);

        try {
            // SMTP configurations
            $mail->isSMTP();
            $mail->Host       = EnvLoader::get('SMTP_HOST', 'smtp.gmail.com');
            $mail->SMTPAuth   = true;
            $mail->Username   = EnvLoader::get('SMTP_USER', 'ayan14.ds@gmail.com');
            $mail->Password   = EnvLoader::get('SMTP_PASS', 'bgqmolrrigmbdbli');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = EnvLoader::get('SMTP_PORT', 587);

            // Sender and Recipient
            $fromEmail = EnvLoader::get('SMTP_FROM_EMAIL', 'ayan14.ds@gmail.com');
            $fromName  = EnvLoader::get('SMTP_FROM_NAME', 'OBEMS Platform');
            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($toEmail);

            // Content Format
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $bodyHTML;
            
            if (!empty($bodyPlain)) {
                $mail->AltBody = $bodyPlain;
            } else {
                $mail->AltBody = strip_tags($bodyHTML);
            }

            $mail->send();
            return true;
        } catch (Exception $e) {
            if (isset($GLOBALS['fileLogger'])) {
                $GLOBALS['fileLogger']->error('EmailService', 'PHPMailer Exception', ['error' => $mail->ErrorInfo]);
            }
            throw new Exception("Email dispatch failed: " . $mail->ErrorInfo);
        }
    }
}
