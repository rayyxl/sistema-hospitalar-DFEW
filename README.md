# Sistema Hospitalar

Aplicação web demonstrativa para médicos organizarem pacientes e acompanharem informações clínicas. O projeto usa HTML, CSS e JavaScript puro, sem servidor de aplicação ou dependências externas.

## Funcionalidades

- Cadastro de médicos com nome, CRM, especialidade, e-mail e senha; login e encerramento de sessão.
- Painel com totais de pacientes, consultas e exames, além dos cinco registros mais recentes.
- Cadastro, edição, busca por nome ou CPF e remoção de pacientes.
- Prontuário com dados cadastrais, idade calculada, histórico clínico, consultas e exames.
- Registro, edição e remoção de consultas, com data, horário, motivo, diagnóstico e observações.
- Registro, edição e remoção de exames, com tipo, data, resultado e observações.
- Máscaras para CPF e telefone, mensagens de sucesso e erro e confirmação antes de remover registros.

## Como executar

É necessário um navegador moderno e um servidor local. A página de login usa a API Web Crypto para gerar e conferir hashes de senha, recurso que requer `localhost` ou HTTPS.

1. Abra um terminal na pasta raiz do projeto.
2. Inicie um servidor HTTP local:

   ```bash
   python3 -m http.server 8000
   ```

3. Acesse [http://localhost:8000](http://localhost:8000) no navegador.
4. Na tela de login, use o link de cadastro para criar o primeiro médico.

Também é possível usar a extensão Live Server do VS Code. Não é necessário instalar pacotes ou executar uma etapa de build.

## Armazenamento e limitações

Os dados são salvos no `localStorage` do navegador, separados por médico. Eles não são enviados a um servidor nem sincronizados entre navegadores ou dispositivos. Limpar os dados do navegador pode apagá-los.

O arquivo selecionado como laudo de exame não é armazenado: o sistema registra somente o nome do arquivo. O CPF recebe formatação pela máscara, mas não passa por validação de existência ou de dígitos verificadores.

Este projeto é demonstrativo e não deve ser usado para armazenar dados reais de pacientes. O armazenamento e a verificação de sessão acontecem no lado do cliente; não há backend nem controles de segurança apropriados para produção.

## Tecnologias

- HTML5 para as páginas e formulários.
- CSS3 para os estilos compartilhados e específicos de cada tela.
- JavaScript nativo para navegação, validação, máscaras, interface e persistência.
- `localStorage` para dados e sessão; Web Crypto API para hash de senhas com sal.

## Estrutura do projeto

```text
.
├── index.html                 # Login
├── html/                      # Cadastro, painel, pacientes e registros clínicos
├── css/                       # Estilos globais e estilos por página
├── js/                        # Lógica das páginas, utilitários e armazenamento
└── README.md
```

### Páginas

- `index.html`: login do médico.
- `html/cadastro-medico.html`: cadastro de acesso do médico.
- `html/dashboard.html`: resumo do sistema e atalhos.
- `html/pacientes.html`: busca e lista de pacientes.
- `html/paciente-novo.html` e `html/paciente-editar.html`: cadastro e edição de pacientes.
- `html/prontuario.html`: dados cadastrais e histórico clínico do paciente.
- `html/consulta-form.html` e `html/consultas.html`: formulário e lista de consultas.
- `html/exame-form.html` e `html/exames.html`: formulário e lista de exames.

### Organização do JavaScript

- `js/storage.js`: acesso ao `localStorage`, sessão e operações de dados.
- `js/global.js`: controle de acesso às páginas, utilitários, máscaras, avisos e funções comuns de interface.
- `js/login.js` e `js/cadastro-medico.js`: autenticação e cadastro do médico.
- `js/dashboard.js`: indicadores e registros recentes.
- `js/pacientes.js`, `js/paciente-form.js` e `js/prontuario.js`: busca, cadastro, edição e exibição do prontuário.
- `js/consulta-form.js` e `js/consultas.js`: cadastro, edição, listagem e remoção de consultas.
- `js/exame-form.js` e `js/exames.js`: cadastro, edição, listagem e remoção de exames.

Os registros de consultas e exames são vinculados a um paciente. Ao remover um paciente, seus registros associados também são removidos.