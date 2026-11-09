// Carrega e configura a lista de consultas do paciente.
SH.pagina(function () {
    'use strict';

    const el = SH.ui.el;
    const paciente = SH.pacientes.buscar(SH.util.parametro('paciente'));

    if (!paciente) {
        SH.ui.avisarDepois('Paciente não encontrado. Escolha um paciente da lista.', 'erro');
        window.location.replace('pacientes.html');
        return;
    }

    const corpo = document.getElementById('lista-consultas');
    const consulta = '?paciente=' + encodeURIComponent(paciente.id);

    document.getElementById('nome-paciente').textContent = paciente.nome;
    document.getElementById('link-voltar').href = 'prontuario.html' + consulta;
    document.getElementById('link-nova-consulta').href = 'consulta-form.html' + consulta;

    // Cria os controles para editar ou remover uma consulta.
    function celulaDeAcoes(registro) {
        return el('div', { classe: 'acoes' }, [
            el('a', { href: 'consulta-form.html?id=' + encodeURIComponent(registro.id), texto: 'Editar' }),
            el('button', {
                type: 'button',
                texto: 'Remover',
                onclick:
                    // Remove a consulta associada ao botão.
                    function () { remover(registro); }
            })
        ]);
    }

    // Desenha na tabela as consultas ordenadas por data.
    function desenhar() {
        const lista = SH.util.ordenarRecentes(SH.consultas.listarPorPaciente(paciente.id));

        if (lista.length === 0) {
            SH.ui.linhaVazia(corpo, 5, 'Nenhuma consulta registrada para este paciente.');
            return;
        }

        SH.ui.limpar(corpo);
        lista.forEach(
            // Adiciona uma linha para cada consulta.
            function (registro) {
                corpo.appendChild(SH.ui.linha([
                    SH.util.formatarData(registro.data),
                    registro.horario || '-',
                    registro.motivo,
                    registro.diagnostico || '-',
                    celulaDeAcoes(registro)
                ]));
            }
        );
    }

    // Confirma e remove uma consulta da lista.
    function remover(registro) {
        const confirmado = window.confirm(
            'Remover a consulta de ' + SH.util.formatarData(registro.data) + ' ("' + registro.motivo + '")?\n\n' +
            'Esta ação não pode ser desfeita.'
        );
        if (!confirmado) {
            return;
        }

        try {
            SH.consultas.remover(registro.id);
            desenhar();
            SH.ui.avisar('Consulta removida.', 'sucesso');
        } catch (erro) {
            SH.ui.avisar(erro.message, 'erro');
        }
    }

    desenhar();
});
