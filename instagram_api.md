
-----

## Endpoints de Automação

Estes endpoints permitem que o seu aplicativo interaja com a conta do Instagram de forma automatizada.

### `POST /api/instagram/login`

Este endpoint faria a chamada para o método `init()` da classe `Instagram`.

  * **Ação**: Inicia a automação, lança o navegador e realiza o login na conta do Instagram.
  * **Corpo da Requisição**:
    ```json
    {
      "username": "seu_usuario",
      "password": "sua_senha"
    }
    ```
  * **Resposta**: Uma mensagem de sucesso ou erro indicando o status do login.

### `POST /api/instagram/like`

Este endpoint corresponderia ao método `likePost(postId: string)`.

  * **Ação**: Curte um post específico usando o ID do post.
  * **Corpo da Requisição**:
    ```json
    {
      "postId": "C5d3Tz7uF9C"
    }
    ```
  * **Resposta**: Sucesso ou falha ao curtir o post.

### `POST /api/instagram/comment`

Este endpoint chamaria o método `commentPost(postId: string, comment: string)`.

  * **Ação**: Adiciona um comentário a um post específico.
  * **Corpo da Requisição**:
    ```json
    {
      "postId": "C5d3Tz7uF9C",
      "comment": "Que foto incrível!"
    }
    ```
  * **Resposta**: Sucesso ou falha ao publicar o comentário.

### `POST /api/instagram/message`

Este endpoint usaria o método `sendMessage(userId: string, message: string)`.

  * **Ação**: Envia uma mensagem direta (DM) para um usuário.
  * **Corpo da Requisição**:
    ```json
    {
      "userId": "usuario_destino",
      "message": "Olá, tudo bem?"
    }
    ```
  * **Resposta**: Sucesso ou falha ao enviar a mensagem.

### `POST /api/instagram/photo`

Este endpoint chamaria o método `postPhoto(imagePath: string, caption?: string)`.

  * **Ação**: Publica uma foto no feed do Instagram.
  * **Corpo da Requisição**:
    ```json
    {
      "imagePath": "caminho/para/sua/imagem.jpg",
      "caption": "Minha nova postagem! #nextron"
    }
    ```
  * **Resposta**: Sucesso ou falha ao postar a foto.

### `POST /api/instagram/follow`

Este endpoint usaria o método `followUser(userId: string)`.

  * **Ação**: Segue um perfil de usuário.
  * **Corpo da Requisição**:
    ```json
    {
      "userId": "usuario_a_seguir"
    }
    ```
  * **Resposta**: Sucesso ou falha ao seguir o usuário.

### `POST /api/instagram/unfollow`

Este endpoint corresponderia ao método `unfollowUser(userId: string)`.

  * **Ação**: Deixa de seguir um perfil de usuário.
  * **Corpo da Requisição**:
    ```json
    {
      "userId": "usuario_a_parar_de_seguir"
    }
    ```
  * **Resposta**: Sucesso ou falha ao deixar de seguir o usuário.

-----

## Endpoints de Monitoramento e Estado

Estes endpoints gerenciam o ciclo de vida e o estado do bot.

### `GET /api/instagram/status`

Este endpoint verificaria o estado de login e monitoramento.

  * **Ação**: Retorna o status atual da instância da classe.
  * **Resposta**:
    ```json
    {
      "loggedIn": true,
      "isMonitoring": false
    }
    ```

### `POST /api/instagram/monitor/start`

Este endpoint chamaria o método `monitorNewMessages()`.

  * **Ação**: Inicia o monitoramento contínuo de novas mensagens diretas na caixa de entrada.
  * **Corpo da Requisição**: Opcionalmente, pode receber configurações.
    ```json
    {
      "checkInterval": 30000,
      "includeRequests": true
    }
    ```
  * **Resposta**: Sucesso ao iniciar o monitoramento.

### `POST /api/instagram/monitor/stop`

Este endpoint chamaria o método `switchMonitoring(false)`.

  * **Ação**: Para o processo de monitoramento de novas mensagens.
  * **Resposta**: Sucesso ao parar o monitoramento.

### `POST /api/instagram/close`

Este endpoint usaria o método `close()`.

  * **Ação**: Fecha a instância do navegador Puppeteer e limpa os recursos.
  * **Resposta**: Sucesso ao fechar a sessão.