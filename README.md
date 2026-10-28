# Document Management System com GitHub Copilot

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey dinoguerreiro!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/treinamentos-mpba/document-management-system-dino-ex3/issues/1)

---

## Executar a aplicação

Em terminais separados, execute `npm start` em `backend` e `npm run dev` em
`frontend` (com as dependências instaladas via `npm ci` em cada pasta).
Abra `http://localhost:5173`.

A interface permite selecionar um arquivo, informar um dono opcional, enviar,
listar os metadados e baixar documentos. A lista é atualizada após cada envio;
falhas são exibidas na própria interface e podem ser tentadas novamente.
O cliente usa `fetch` com o prefixo `/api`, encaminhado pelo proxy do Vite ao
backend em `http://localhost:3000`. Em produção, configure o mesmo encaminhamento
de `/api` no servidor que hospeda o frontend.

Validação: `npm test` nas duas pastas e `npm run build` em `frontend`.

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)
