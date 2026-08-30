import os
import re
import urllib.request
import urllib.parse
from pathlib import Path

BASE_URL = "https://www.cordially.io"
TARGET_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_HTML_PATH = os.path.join(os.path.dirname(TARGET_DIR), "demo_source.html")

translations = {
    "Cordially": "Essenza",
    "Jim &amp; Pam": "Ana &amp; João",
    "Jim & Pam": "Ana & João",

    "Flight": "Voo",
    "Getting There": "Como Chegar",
    "Add the closest airport, train station, or driving instructions guests should use when planning their trip.": "Adicione o aeroporto mais próximo, estação de trem ou instruções de carro.",
    "Staying": "Onde Ficar",
    "Travel Note": "Nota de Viagem",
    "Share your preferred hotel block, neighborhood, or rental guidance here so guests know where to stay.": "Compartilhe as opções de hotéis, bairros ou aluguéis sugeridos para os convidados.",
    "Getting to & from the Venue": "Chegando e Saindo do Local",
    "Explain parking, shuttles, rideshare availability, or any arrival instructions guests should know before the event.": "Explique sobre estacionamento, vans, ubers ou outras instruções de chegada.",
    "Things to do": "O Que Fazer",
    "Things to Do Nearby": "Atrações Próximas",
    "List a few restaurants, coffee shops, sights, or weekend activities for out-of-town guests who want recommendations.": "Liste alguns restaurantes, cafés e pontos turísticos para os convidados de fora.",
    "Your presence at our wedding is the greatest gift of all. If you would like to honor us with a gift, a contribution towards our future together would mean a lot.": "Sua presença é o nosso maior presente. Se desejar nos presentear, uma contribuição para o nosso futuro será muito bem-vinda.",
    "For Canadian Guests": "Para Convidados do Brasil",
    "Interac e-Transfer": "PIX",
    "We gratefully accept e-Transfers sent to [Your Email Address].": "Aceitamos contribuições via PIX usando a chave [Sua Chave PIX].",
    "For American Guests": "Para Convidados Internacionais",
    "Venmo": "Transferência Bancária",
    "We gratefully accept contributions via Venmo at @[Your Venmo Handle].": "Aceitamos transferências bancárias. Entre em contato para detalhes.",
    "A Note on Gifts": "Uma Nota sobre Presentes",
    "Thank You": "Obrigado",
    "We are incredibly thankful for your love and support. Having you there matters most.": "Somos incrivelmente gratos pelo seu amor e apoio. Ter você lá é o que mais importa.",
    "Think summer garden party.": "Pense em uma festa de verão no jardim.",
    "For the Ladies": "Para as Mulheres",
    "Elegant, colorful, and comfortable": "Elegante, colorido e confortável",
    "Tea or floor-length dresses are welcome. Bright colors and florals are encouraged.": "Vestidos longos ou midi são bem-vindos. Cores vivas e estampas florais são incentivadas.",
    "Wear comfortable shoes for wandering and dancing.": "Use sapatos confortáveis para caminhar e dançar.",
    "For the Gentlemen": "Para os Homens",
    "Classic with a summer touch": "Clássico com um toque de verão",
    "Dress shirts and suits are perfect. Linen and lighter colors are encouraged.": "Camisas e ternos são perfeitos. Linho e cores mais claras são incentivados.",
    "Keep things polished but breathable for a warm summer evening.": "Mantenha o estilo elegante, mas leve para uma noite quente.",
    "We are working with our caterer to finalize a delicious multi-course meal for everyone.": "Estamos trabalhando com nosso buffet para finalizar um delicioso menu para todos.",
    "Cocktail Hour": "Coquetel",
    "Passed Canapes": "Canapés Servidos",
    "Seasonal tartlet with whipped goat cheese and herbs.": "Tartelete sazonal com queijo de cabra e ervas.",
    "Crispy prawn skewer with citrus aioli.": "Espeto de camarão crocante com aioli cítrico.",
    "Truffle arancini with parmesan.": "Arancini trufado com parmesão.",
    "Main Course": "Prato Principal",
    "Plated Dinner": "Jantar Servido",
    "Herb-roasted chicken with garlic mashed potatoes and market vegetables.": "Frango assado com ervas, purê de batatas com alho e legumes.",
    "Miso-glazed salmon with jasmine rice and bok choy.": "Salmão glaceado com missô, arroz de jasmim e acelga.",
    "Wild mushroom risotto with roasted asparagus.": "Risoto de cogumelos selvagens com aspargos assados.",
    "Dietary Restrictions": "Restrições Alimentares",
    "We can accommodate": "Podemos acomodar",
    "Please include allergies and dietary restrictions with your RSVP.": "Por favor, inclua alergias e restrições alimentares no seu RSVP.",
    "Vegetarian, gluten-free, and dairy-free options will be available.": "Opções vegetarianas, sem glúten e sem lactose estarão disponíveis.",
    "Set the tone for the weekend with a playlist that feels like you.": "Crie o clima do fim de semana com uma playlist que tenha a sua cara.",
    "Wedding Playlist": "Playlist do Casamento",

    "J&amp;P": "A&amp;J",
    "J&P": "A&J",
    "our story": "nossa história",
    "chapter one: how we met": "capítulo um: como nos conhecemos",
    "chapter two: falling in love": "capítulo dois: nos apaixonando",
    "chapter three: the next step": "capítulo três: o próximo passo",
    "We met at university, became fast friends, and eventually realized the best parts of every week were the parts we spent together.": "Nos conhecemos na universidade, viramos grandes amigos e percebemos que as melhores partes de cada semana eram aquelas que passávamos juntos.",
    "Toronto became our home base for late dinners, weekend walks, shared routines, and all of the small moments that made life feel bigger.": "Nossa cidade se tornou base para jantares, passeios, rotinas compartilhadas e todos os pequenos momentos que tornaram a vida mais especial.",
    "A trip, a question, a very easy yes, and suddenly the future we had been imagining became something we could invite everyone into.": "Uma viagem, uma pergunta, um sim muito fácil, e de repente o futuro que imaginávamos se tornou algo para o qual poderíamos convidar a todos.",
    "First year on campus": "Primeiro ano no campus",
    "Coffee between classes": "Café entre as aulas",
    "The start of everything": "O começo de tudo",
    "A favorite city corner": "Um canto favorito da cidade",
    "Weekends downtown": "Finais de semana no centro",
    "Our everyday ritual": "Nosso ritual diário",
    "The weekend away": "O fim de semana fora",
    "Right after yes": "Logo após o sim",
    "Celebrating together": "Celebrando juntos",
    "so please join us...": "então por favor, junte-se a nós...",
    "june 18, 2027": "18 de junho de 2027",
    "Days": "Dias",
    "Hours": "Horas",
    "Minutes": "Minutos",
    "Seconds": "Segundos",
    "Cecil Green Park House": "Fazenda Vila Rica",
    "6251 Cecil Green Park Rd, Vancouver, BC": "Itatiba, SP",
    "RSVP by august 20, 2027": "Confirme presença até 20 de agosto de 2027",
    "and now some additional details...": "e agora alguns detalhes adicionais...",
    "The people, places, and practical details that will make the weekend feel effortless.": "As pessoas, lugares e detalhes práticos que farão o final de semana ser inesquecível.",
    "Wedding Parties": "Padrinhos e Madrinhas",
    "Meet our favorite people.": "Conheça nossas pessoas favoritas.",
    "Travel Logistics": "Logística e Viagem",
    "Plan your trip and stay.": "Planeje sua viagem e estadia.",
    "Registry": "Lista de Presentes",
    "Your presence is enough, but if you insist...": "Sua presença é o suficiente, mas se você insiste...",
    "Dress Code": "Traje",
    "Summer garden party vibes.": "Passeio completo (Terno e Vestido Longo).",
    "Dinner Menu": "Menu do Jantar",
    "A quick look at what we are serving.": "Uma rápida olhada no que vamos servir.",
    "Music": "Música",
    "Cocktail hour and dance party playlists.": "Playlists do coquetel e da festa.",
    "The vision for the night is simple: all of our most beloved people in one place that happens to have a gorgeous garden, flowing drinks, and an unforgettable dance floor.": "A visão para a noite é simples: todas as nossas pessoas mais amadas em um só lugar, com um jardim lindo, ótimos drinks e uma pista de dança inesquecível.",
    "Questions and answers": "Perguntas e Respostas",
    "Can&#x27;t find the answer here?": "Não encontrou a resposta aqui?",
    "Reach out to Jim or Pam": "Fale com a Ana ou com o João",
    "When should I RSVP by?": "Até quando devo confirmar presença?",
    "Please RSVP by August 20, 2027.": "Por favor, confirme até 20 de agosto de 2027.",
    "Is there a dress code?": "Qual é o traje?",
    "Yes! Think Summer Garden Party.": "Sim! Traje Passeio Completo.",
    "Submit RSVP": "Confirmar Presença",
    "Scroll to explore": "Role para explorar",
    "you’re my favorite person to do anything with for the rest of my life.": "você é a minha pessoa favorita para fazer qualquer coisa pelo resto da minha vida.",
    "Is the wedding outdoors?": "O casamento será ao ar livre?",
    "Yes! The ceremony will take place in the garden and the reception will take place on the terrace.": "Sim! A cerimônia acontecerá no jardim e a recepção no terraço.",
    "What will the weather be like? What happens if it rains?": "Como estará o tempo? O que acontece se chover?",
    "Expect a warm afternoon and a cooler evening. We recommend bringing a light layer just in case.\\n\\nIf the weather shifts, the venue has an indoor backup plan ready to go.": "Espere uma tarde quente e uma noite mais fresca. Recomendamos trazer um agasalho leve por precaução.\\n\\nSe o tempo mudar, o local tem um plano B interno pronto.",
    "Can I bring a plus one or my kids?": "Posso levar acompanhante ou meus filhos?",
    "We are keeping the guest list intimate, so plus-ones and children may be limited depending on your invitation.\\n\\nPlease reach out if you have any questions about your household.": "Estamos mantendo a lista de convidados íntima, então acompanhantes e crianças podem ser limitados dependendo do seu convite.\\n\\nPor favor, entre em contato se tiver alguma dúvida.",
    "What time should I arrive at the ceremony?": "A que horas devo chegar para a cerimônia?",
    "Please plan to arrive about 15 minutes before the ceremony begins so everyone has time to get settled.": "Por favor, planeje chegar cerca de 15 minutos antes do início da cerimônia para que todos possam se acomodar.",
    "I have a food allergy, can I make a special request?": "Tenho alergia alimentar, posso fazer um pedido especial?",
    "Yes! Please make note of any food allergies or restrictions when submitting your RSVP and we will do our best to accommodate.": "Sim! Por favor, anote quaisquer alergias ou restrições alimentares ao confirmar sua presença e faremos o nosso melhor para acomodar.",
    "Is there parking at the venue?": "Há estacionamento no local?",
    "Use this answer to share parking, drop-off, shuttle, or rideshare instructions for your venue.": "O local possui estacionamento com manobrista na entrada principal.",
    "Help! I have other questions!": "Socorro! Tenho outras dúvidas!",
    "Please reach out at your-email@example.com with any other questions.\\n\\nWe cannot wait to celebrate with you.": "Por favor, entre em contato através do email your-email@example.com se tiver outras dúvidas.\\n\\nMal podemos esperar para comemorar com você.",
    ">you&#x27;re<": ">você<",
    ">cordially<": ">está<",
    ">invited<": ">cordialmente<",
    ">to<": ">convidado<",
    ">celebrate<": ">para<",
    ">the<": ">celebrar<",
    ">story<": ">a<",
    ">of...<": ">história...<",
    ">The<": ">A<",
    ">vision<": ">visão<",
    ">for<": ">para<",
    ">night<": ">noite<",
    ">is<": ">é<",
    ">simple:<": ">simples:<",
    ">all<": ">todas<",
    ">of<": ">as<",
    ">our<": ">nossas<",
    ">most<": ">pessoas<",
    ">beloved<": ">mais<",
    ">people<": ">amadas<",
    ">in<": ">em<",
    ">one<": ">um<",
    ">place<": ">só lugar<",
    ">that<": ">que<",
    ">happens<": ">por acaso<",
    ">have<": ">tem<",
    ">a<": ">um<",
    ">gorgeous<": ">lindo<",
    ">garden,<": ">jardim,<",
    ">flowing<": ">bons<",
    ">drinks,<": ">drinks,<",
    ">and<": ">e<",
    ">an<": ">uma<",
    ">unforgettable<": ">inesquecível<",
    ">dance<": ">pista de<",
    ">floor.<": ">dança.<",
}

def translate_content(text):
    for eng, pt in translations.items():
        text = text.replace(eng, pt)
    return text

def download_file(url, local_path):
    if os.path.exists(local_path):
        return True
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            content = response.read()
            
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, 'wb') as f:
            f.write(content)
        print(f"Downloaded: {url}")
        
        # If JS or CSS, apply translation and rewrite URLs
        if local_path.endswith('.js') or local_path.endswith('.css') or local_path.endswith('.html'):
            try:
                text_content = content.decode('utf-8')
                translated = translate_content(text_content)
                with open(local_path, 'w', encoding='utf-8') as f:
                    f.write(translated)
            except Exception as e:
                pass # Not text editable
                
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

def extract_urls(text):
    # Regex for href="/...", src="/...", etc.
    urls = []
    # match href="/...", src="/..."
    for match in re.finditer(r'(?:href|src)=["\'](/[^"\']+)["\']', text):
        urls.append(match.group(1))
    
    # match url(/...)
    for match in re.finditer(r'url\([\'"]?(/[^)\'"]+)[\'"]?\)', text):
        urls.append(match.group(1))
        
    # match /_next/... in general (like in JS)
    for match in re.finditer(r'["\'](/_next/[^"\']+)["\']', text):
        urls.append(match.group(1))
        
    return list(set(urls))

def process_html():
    with open(SOURCE_HTML_PATH, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Quick translation on HTML
    html_content = translate_content(html_content)
    
    # Find all URLs in HTML
    urls = extract_urls(html_content)
    
    for url in urls:
        # Some URLs might have queries like /demo/...?v=...
        clean_url = url.split('?')[0]
        # Ignore external or weird urls
        if not clean_url.startswith('/'): continue
        
        full_url = BASE_URL + url
        # Use clean_url for local path, but we keep url encoded queries out of file names
        # remove fragments
        clean_url = clean_url.split('#')[0]
        
        # decoded path
        decoded_path = urllib.parse.unquote(clean_url)
        local_path = os.path.join(TARGET_DIR, decoded_path.lstrip('/'))
        
        download_file(full_url, local_path)
        
    # Save the index.html
    # Tirar animação (flor/pulo) e SVG do botão de pular para baixo
    html_content = re.sub(r'<svg[^>]*class="[^"]*animate-bounce[^"]*"[^>]*>.*?</svg>', '', html_content)
    html_content = html_content.replace('animate-bounce', '')
    
    with open(os.path.join(TARGET_DIR, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("Finished processing index.html")

if __name__ == "__main__":
    process_html()
