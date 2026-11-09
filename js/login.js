// Configura a tela de acesso e seus comportamentos.
SH.pagina(function () {
    'use strict';

    const form = document.getElementById('form-login');

    if (SH.util.parametro('cadastrado') === '1') {
        SH.ui.avisar('Cadastro realizado com sucesso! Entre com seu e-mail e senha.', 'sucesso');
    }

    form.addEventListener('submit',
        // Valida as credenciais e inicia a sessão do médico.
        async function (evento) {
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
        }
    );
});
