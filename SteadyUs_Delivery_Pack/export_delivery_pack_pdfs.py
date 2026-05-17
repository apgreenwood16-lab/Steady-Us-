from pathlib import Path
from weasyprint import HTML

base = Path('/home/ubuntu/SteadyUs_Delivery_Pack')
exports = [
    ('client_session_guide.html', 'SteadyUs_Client_Session_Guide.pdf'),
    ('coach_delivery_playbook.html', 'SteadyUs_Coach_Delivery_Playbook.pdf'),
    ('coach_call_notes_form.html', 'SteadyUs_Coach_Call_Notes_Form.pdf'),
]

for html_name, pdf_name in exports:
    html_path = base / html_name
    pdf_path = base / pdf_name
    HTML(filename=str(html_path), base_url=str(base)).write_pdf(str(pdf_path))
    print(f'Created {pdf_path}')
