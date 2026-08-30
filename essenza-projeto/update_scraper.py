import re

with open("C:/Users/booki/Antigravity/essenza-projeto/scraper.py", "r", encoding="utf-8") as f:
    content = f.read()

new_translations = """
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
"""

# Insert new translations
content = content.replace('"Jim & Pam": "Ana & João",', '"Jim & Pam": "Ana & João",\n' + new_translations)

with open("C:/Users/booki/Antigravity/essenza-projeto/scraper.py", "w", encoding="utf-8") as f:
    f.write(content)
