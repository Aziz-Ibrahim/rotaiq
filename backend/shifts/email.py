import os
import qrcode
import base64
from io import BytesIO
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_invitation_email(sender_name, sender_branch, recipient_email, token):
    """
    Sends an email invitation to a new user.
    """
    # The URL for the registration page.
    # Use the final domain name from an environment variable for flexibility.
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://rotaiq.uk')
    invitation_url = f"{FRONTEND_URL}/register?token={token}"

    # Generate the QR code for the invitation URL
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(invitation_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    # Create the HTML and plain text content for the email
    html_content = render_to_string(
        'emails/invitation.html', 
        {
            'sender_name': sender_name,
            'sender_branch': sender_branch,
            'invitation_url': invitation_url,
            'qr_code_image': qr_base64,
        }
    )
    text_content = strip_tags(html_content)

    # Email subject
    subject = f"You've been invited to join the team at {sender_branch}!"

    # Send the email
    msg = EmailMultiAlternatives(
        subject,
        text_content,
        os.environ.get('DEFAULT_FROM_EMAIL', 'support@rotaiq.uk'),
        [recipient_email],
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()