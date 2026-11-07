/* ==========================================================
   login.js - Tela de acesso (index.html)
   Confere e-mail e senha com os médicos guardados no localStorage.
   ========================================================== */
SH.pagina(function () {
    'use strict';

    const form = document.getElementById('form-login');

    // Vem do cadastro: index.html?cadastrado=1
    if (SH.util.parametro('cadastrado') === '1') {
        SH.ui.avisar('Cadastro realizado com sucesso! Entre com seu e-mail e senha.', 'sucesso');
    }

    form.addEventListener('submit', async function (evento) {
        evento.preventDefault();
        SH.ui.limparAvisos();

        const email = form.elements.email.value;
        const senha = form.elements.senha.value;

        try {
            if (SH.medicos.total() === 0) {
                SH.ui.avisar('Nenhum médico cadastrado ainda. Use o link "Cadastre-se como médico" para criar seu acesso.', 'erro');
                return;
            }

            const medico = SH.medicos.buscarPorEmail(email);
            const senhaConfere = medico ? await SH.auth.conferir(senha, medico.senhaHash) : false;

            if (!senhaConfere) {
                SH.ui.avisar('E-mail ou senha incorretos.', 'erro');
                return;
            }

            SH.sessao.iniciar(medico.id);
            window.location.href = SH.raiz + 'html/dashboard.html';
        } catch (erro) {
            SH.ui.avisar(erro.message, 'erro');
        }
    });
});
