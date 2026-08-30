# Essenza - Demo do SaaS

Este projeto contém a versão clonada e traduzida do site demo original, adaptada para o SaaS "Essenza". O conteúdo (HTML, estilos, scripts) foi processado para traduzir a interface para português e substituir nomes e locais pelo padrão definido.

## Como Executar Localmente

Para visualizar o site e validar as traduções e estilos, você pode iniciar um servidor HTTP local:

1. Abra um terminal na pasta do projeto (`C:\Users\booki\Antigravity\essenza-projeto`).
2. Execute o seguinte comando usando Python (já instalado em sua máquina):
   ```bash
   python -m http.server 8000
   ```
3. Abra o seu navegador e acesse a URL: [http://localhost:8000](http://localhost:8000)

## Implantação (Deploy)

A pasta atual contém todos os arquivos estáticos necessários para implantação. Você pode enviar o conteúdo desta pasta (`essenza-projeto`) para serviços de hospedagem estática gratuitos e rápidos, como:

* **Vercel**: Basta arrastar a pasta para o painel da Vercel ou usar a CLI (`vercel`).
* **Netlify**: O processo "Drag and Drop" no site do Netlify funciona perfeitamente para esta estrutura.
* **GitHub Pages**: Crie um repositório e ative o GitHub Pages.

## Modificações Adicionais

Se você precisar ajustar ou adicionar mais traduções, basta atualizar o dicionário de traduções no arquivo `scraper.py` e executá-lo novamente no terminal:
```bash
python scraper.py
```
Isso gerará novamente o `index.html` e processará os assets baixados com os novos termos.
