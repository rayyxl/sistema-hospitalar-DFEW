# Sistema Hospitalar

<img src="images/icone-180.png" alt="Logo do Sistema Hospitalar" width="120" />

Sistema web para gestão clínica e administrativa de um consultório ou hospital pequeno, com foco em médicos, pacientes, consultas e exames.

Acesse o sistema online: https://sistema-hospitalar-dfew.vercel.app/

## Visão geral

O Sistema Hospitalar foi desenvolvido para centralizar o acompanhamento de pacientes em um ambiente simples e funcional, permitindo que o profissional de saúde cadastre informações, organize atendimentos e acompanhe histórico clínico em uma única interface.

O projeto é totalmente front-end e utiliza armazenamento local no navegador, o que facilita a execução e demonstração sem a necessidade de backend ou banco de dados.

## Funcionalidades

- Cadastro e login de médicos
- Dashboard com indicadores gerais
- Cadastro, edição e remoção de pacientes
- Busca por nome ou CPF
- Prontuário do paciente com dados clínicos e históricos
- Registro de consultas com diagnóstico e observações
- Registro de exames com tipo, data e resultado
- Validações e máscaras de campos como CPF e telefone
- Confirmação antes de exclusões
- Sessão do usuário salva no navegador

## Interface do projeto

<p align="center">
  <img src="images/icone.svg" alt="Ícone do Sistema Hospitalar" width="180" />
</p>

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript puro
- Web Storage (`localStorage`)
- Web Crypto API para hash de senha

## Como acessar

### Online

A forma mais simples de usar o sistema é diretamente pelo link abaixo:

- URL: https://sistema-hospitalar-dfew.vercel.app/

### Localmente no VS Code

Se preferir rodar localmente, siga estes passos:

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão Live Server, se ainda não tiver.
3. Clique com o botão direito em `index.html` e selecione "Open with Live Server".
4. O navegador abrirá a aplicação em um endereço local, normalmente semelhante a:

```text
http://localhost:5500
```

5. Na tela de login, use o cadastro de médico para criar o primeiro usuário.

> O sistema foi pensado para funcionar em ambiente local ou em HTTPS/localhost, especialmente por usar a API Web Crypto para geração e verificação de hashes de senha.

## Estrutura do projeto

```text
.
├── index.html
├── html/
│   ├── cadastro-medico.html
│   ├── dashboard.html
│   ├── pacientes.html
│   ├── paciente-novo.html
│   ├── paciente-editar.html
│   ├── prontuario.html
│   ├── consulta-form.html
│   ├── consultas.html
│   ├── exame-form.html
│   └── exames.html
├── css/
│   ├── cadastro-medico.css
│   ├── consulta-form.css
│   ├── consultas.css
│   ├── dashboard.css
│   ├── exame-form.css
│   ├── exames.css
│   ├── global.css
│   ├── login.css
│   ├── paciente-editar.css
│   ├── paciente-novo.css
│   ├── pacientes.css
│   └── prontuario.css
├── js/
│   ├── cadastro-medico.js
│   ├── consulta-form.js
│   ├── consultas.js
│   ├── dashboard.js
│   ├── exame-form.js
│   ├── exames.js
│   ├── global.js
│   ├── login.js
│   ├── paciente-form.js
│   ├── pacientes.js
│   ├── prontuario.js
│   ├── storage.js
│   └── global.js
├── images/
│   ├── icone.svg
│   └── icone-180.png
├── README.md
└── index.html
```

## Fluxo principal do sistema

- Médico realiza login ou cadastro
- Acessa o dashboard e visualiza os principais indicadores
- Cadastra pacientes e mantém registros organizados
- Cria consultas e exames vinculados ao paciente
- Consulta prontuário para acompanhar evolução clínica

## Observações importantes

- Os dados são armazenados no `localStorage` do navegador.
- A aplicação não possui backend, então os dados não são sincronizados entre dispositivos ou navegadores.
- O sistema é uma solução demonstrativa e não deve ser usada para armazenar dados reais sensíveis sem a devida estrutura de segurança e backend profissional.
- Arquivos de laudo de exame são registrados apenas pelo nome do arquivo, não sendo armazenados no servidor.

## Contribuição

Este projeto pode ser utilizado como base para estudos, prototipos e melhorias em sistemas de gestão hospitalar, sendo livre para adaptação conforme a necessidade do desenvolvimento.