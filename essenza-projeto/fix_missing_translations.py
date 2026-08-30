import sys

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

replacements = [
    (r"you're cordially invited to celebrate the story of...", r"você está cordialmente convidado para celebrar a história de..."),
    (r"Introduce the people standing with you on the wedding day and add their names, roles, and photos here.", r"Apresente as pessoas que estarão ao seu lado no dia do casamento e adicione seus nomes, papéis e fotos aqui."),
    (r'"Bridal Party"', r'"Madrinhas"'),
    (r"Upload a portrait", r"Fazer upload de um retrato"),
    (r"Add a photo for this person.", r"Adicione uma foto para esta pessoa."),
    (r'"Member 1"', r'"Membro 1"'),
    (r'"Member 2"', r'"Membro 2"'),
    (r'"Member 3"', r'"Membro 3"'),
    (r'"Member 4"', r'"Membro 4"'),
    (r'"Member 5"', r'"Membro 5"'),
    (r'"Member 6"', r'"Membro 6"'),
    (r"Groom’s Party", r"Padrinhos"),
    (r"Travel & Accommodations", r"Logística e Viagem"),
    (r"Travel &amp; Accommodations", r"Logística e Viagem"),
    (r"Use this page to help guests plan their trip, book a stay, and navigate the weekend with less guesswork.", r"Use esta página para ajudar os convidados a planejar a viagem, reservar hospedagem e navegar pelo fim de semana sem dúvidas."),
    (r"Getting to & from the Venue", r"Chegando e Saindo do Local"),
    (r"We gratefully accept contributions via Transferência Bancária at @[Your Transferência Bancária Handle].", r"Agradecemos contribuições via Transferência Bancária para a conta [Sua Conta]."),
    (r"Paste a Spotify playlist, album, or track URL and we will turn it into an embed automatically.", r"Cole o URL de uma playlist, álbum ou faixa do Spotify e nós o transformaremos em um player automaticamente."),
    (r"Expect a warm afternoon and a cooler evening. We recommend bringing a light layer just in case.\n\nIf the weather shifts, the venue has an indoor backup plan ready to go.", r"Espere uma tarde quente e uma noite mais fresca. Recomendamos trazer um agasalho leve por precaução.\n\nSe o tempo mudar, o local tem um plano B interno pronto."),
    (r"Expect a warm afternoon and a cooler evening. We recommend bringing a light layer just in case.\\n\\nIf the weather shifts, the venue has an indoor backup plan ready to go.", r"Espere uma tarde quente e uma noite mais fresca. Recomendamos trazer um agasalho leve por precaução.\\n\\nSe o tempo mudar, o local tem um plano B interno pronto."),
    (r"We are keeping the guest list intimate, so plus-ones and children may be limited depending on your invitation.\n\nPlease reach out if you have any questions about your household.", r"Estamos mantendo a lista de convidados íntima, então acompanhantes e crianças podem ser limitados dependendo do seu convite.\n\nPor favor, entre em contato se tiver alguma dúvida."),
    (r"We are keeping the guest list intimate, so plus-ones and children may be limited depending on your invitation.\\n\\nPlease reach out if you have any questions about your household.", r"Estamos mantendo a lista de convidados íntima, então acompanhantes e crianças podem ser limitados dependendo do seu convite.\\n\\nPor favor, entre em contato se tiver alguma dúvida."),
    (r"Please reach out at your-email@example.com with any other questions.\n\nWe cannot wait to celebrate with you.", r"Por favor, entre em contato através do email your-email@example.com se tiver outras dúvidas.\n\nMal podemos esperar para comemorar com você."),
    (r"Please reach out at your-email@example.com with any other questions.\\n\\nWe cannot wait to celebrate with you.", r"Por favor, entre em contato através do email your-email@example.com se tiver outras dúvidas.\\n\\nMal podemos esperar para comemorar com você."),
]

for old, new in replacements:
    html = html.replace(old, new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Done translating!')
