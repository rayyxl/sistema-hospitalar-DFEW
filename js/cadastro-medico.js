/* ==========================================================
   cadastro-medico.js - Cadastro do médico (html/cadastro-medico.html)
   Valida os dados, guarda a senha como hash e volta ao login.
   ========================================================== */
SH.pagina(function () {
    'use strict';

    const form = document.getElementById('form-cadastro');
    const campos = form.elements;

    form.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        const dados = {
            nome: campos.nome.value.trim().replace(/\s+/g, ' '),
            crm: campos.crm.value.trim().toUpperCase(),
            especialidade: campos.especialidade.value.trim(),
            email: campos.email.value.trim().toLowerCase()
        };
        const senha = campos.senha.value;
        const confirmacao = campos.confirmacao.value;

        const erros = [];
        if (dados.nome.length < 3) {
            erros.push('Informe o seu nome completo.');
        }
        if (!/^\d{4,7}\/[A-Z]{2}$/.test(dados.crm)) {
            erros.push('Informe o CRM no formato 123456/SP (número, barra e sigla do estado).');
        }
        if (dados.especialidade.length < 3) {
            erros.push('Informe a especialidade.');
        }
        if (senha.length < 6) {
            erros.push('A senha precisa ter pelo menos 6 caracteres.');
        }
        if (senha !== confirmacao) {
            erros.push('A confirmação da senha não confere.');
        }
        if (SH.medicos.buscarPorEmail(dados.email)) {
            erros.push('Já existe um médico cadastrado com este e-mail.');
        }

        if (erros.length > 0) {
            SH.ui.avisar(erros, 'erro');
            return;
        }

        try {
            dados.senhaHash = await SH.auth.gerarHash(senha);
            SH.medicos.criar(dados);
            window.location.href = SH.raiz + 'index.html?cadastrado=1';
        } catch (erro) {
            SH.ui.avisar(erro.message, 'erro');
        }
    });
});
