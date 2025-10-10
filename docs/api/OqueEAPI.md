# 🔹 O que é uma API?

**API** significa **Application Programming Interface** (Interface de Programação de
Aplicações).
Ela é como um **“cardápio”** de funções, dados e serviços que um sistema oferece para
que outros sistemas possam interagir com ele.
➡ Em termos simples: uma API é uma **ponte de comunicação entre softwares**.
Exemplo prático:
● Você usa um aplicativo de delivery. Ele precisa calcular o trajeto do motoboy →
ele não cria um sistema de mapas do zero, apenas **consome a API do Google
Maps**.
● Você faz login com o Google ou Facebook em um site → o site está usando a
**API de autenticação do Google/Facebook**.

# 🔹 Como funcionam?

As APIs geralmente funcionam no modelo **requisição e resposta** :

1. Seu sistema (cliente) **faz uma requisição** para a API (por exemplo: “me dê
    todos os usuários”).
2. A API processa no servidor.
3. A API **responde** com os dados, geralmente em **JSON** ou **XML**.
📌 Estrutura de uma requisição típica (REST API):
GET https://api.exemplo.com/users
Resposta (JSON):
[
{ "id": 1, "nome": "Ana" },
{ "id": 2, "nome": "Carlos" }
]

# 🔹 Tipos principais de APIs

1. **REST** → mais comum, baseada em URLs e métodos HTTP (GET, POST, PUT,
    DELETE).
2. **SOAP** → mais antiga, usa XML e protocolos específicos.
3. **GraphQL** → você define exatamente quais dados quer receber.
4. **WebSockets** → comunicação em tempo real (chat, jogos online, bolsa de
    valores).


# 🔹 Exemplos famosos de APIs

```
● Google Maps API → mapas, rotas, geolocalização.
● Twitter API → postar e coletar tweets.
● Spotify API → acessar músicas, playlists, artistas.
● OpenWeather API → previsão do tempo.
● Pix API (Banco Central) → pagamentos instantâneos no Brasil.
```
# 🔹 Como pode ser aplicado em projetos

Você pode usar APIs em vários contextos de software, por exemplo:

1. **Mobile Apps**
    o Seu app de saúde pode consumir a API do Google Fit para puxar passos
       diários.
2. **Web Systems**
    o Um e-commerce pode usar a API dos Correios para calcular frete
       automaticamente.
3. **Integrações Empresariais**
    o Um sistema de estoque pode se integrar com um ERP via API.
4. **IoT (Internet das Coisas)**
    o Um sensor de temperatura pode enviar dados para uma API que guarda
       no banco de dados.

# 🔹 Vantagens de usar APIs

✅ Reuso de serviços prontos (não precisa reinventar a roda).
✅ Facilita integração entre diferentes sistemas.
✅ Escalabilidade (vários clientes consumindo os mesmos dados).
✅ Padronização da comunicação.
👉 Resumindo: **API é a forma de um software conversar com outro software** ,
trocando dados ou funcionalidades.
É **fundamental** em projetos modernos, porque quase tudo que usamos (apps, sites,
serviços) depende de APIs para se conectar com outros sistemas.
