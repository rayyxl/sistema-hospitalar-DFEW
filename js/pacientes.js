/* ==========================================================
   pacientes.js - Lista de pacientes (html/pacientes.html)
   Lista, busca por nome ou CPF e remoção (com confirmação).
   ========================================================== */
SH.pagina(function () {
    'use strict';

    const el = SH.ui.el;
    const corpo = document.getElementById('lista-pacientes');
    const formBusca = document.getElementById('form-busca');
    const campoBusca = document.getElementById('busca');

    function celulaDeAcoes(paciente) {
        return el('div', { classe: 'acoes' }, [
            el('a', { href: 'prontuario.html?paciente=' + encodeURIComponent(paciente.id), texto: 'Ver prontuário' }),
            el('a', { href: 'paciente-editar.html?id=' + encodeURIComponent(paciente.id), texto: 'Editar' }),
            el('button', {
                type: 'button',
                texto: 'Remover',
                onclick: function () { remover(paciente); }
            })
        ]);
    }

    function desenhar() {
        const termo = SH.util.normalizar(campoBusca.value.trim());
        const termoCpf = SH.util.digitos(campoBusca.value);

        const todos = SH.pacientes.listar().sort(function (a, b) {
            return a.nome.localeCompare(b.nome, 'pt-BR');
        });

        const lista = termo === '' ? todos : todos.filter(function (paciente) {
            const nomeConfere = SH.util.normalizar(paciente.nome).includes(termo);
            const cpfConfere = termoCpf !== '' && SH.util.digitos(paciente.cpf).includes(termoCpf);
            return nomeConfere || cpfConfere;
        });

        if (lista.length === 0) {
            SH.ui.linhaVazia(corpo, 5, todos.length === 0
                ? 'Nenhum paciente cadastrado ainda. Use o botão acima para cadastrar o primeiro.'
                : 'Nenhum paciente encontrado para esta busca.');
            return;
        }

        SH.ui.limpar(corpo);
        lista.forEach(function (paciente) {
            corpo.appendChild(SH.ui.linha([
                paciente.nome,
                paciente.cpf,
                SH.util.formatarData(paciente.nascimento),
                paciente.telefone || '-',
                celulaDeAcoes(paciente)
            ]));
        });
    }

    function remover(paciente) {
        const totalConsultas = SH.consultas.listarPorPaciente(paciente.id).length;
        const totalExames = SH.exames.listarPorPaciente(paciente.id).length;

        const confirmado = window.confirm(
            'Remover o paciente "' + paciente.nome + '"?\n\n' +
            'Também serão apagadas ' + totalConsultas + ' consulta(s) e ' + totalExames + ' exame(s) dele.\n' +
            'Esta ação não pode ser desfeita.'
        );
        if (!confirmado) {
            return;
        }

        try {
            SH.pacientes.remover(paciente.id);
            desenhar();
            SH.ui.avisar('Paciente "' + paciente.nome + '" removido.', 'sucesso');
        } catch (erro) {
            SH.ui.avisar(erro.message, 'erro');
        }
    }

    formBusca.addEventListener('submit', function (evento) {
        evento.preventDefault();
        desenhar();
    });
    campoBusca.addEventListener('input', desenhar);

    desenhar();
});
