// Carrega e configura a lista de exames do paciente.
SH.pagina(function () {
    'use strict';

    const el = SH.ui.el;
    const paciente = SH.pacientes.buscar(SH.util.parametro('paciente'));

    if (!paciente) {
        SH.ui.avisarDepois('Paciente não encontrado. Escolha um paciente da lista.', 'erro');
        window.location.replace('pacientes.html');
        return;
    }

    const corpo = document.getElementById('lista-exames');
    const consulta = '?paciente=' + encodeURIComponent(paciente.id);

    document.getElementById('nome-paciente').textContent = paciente.nome;
    document.getElementById('link-voltar').href = 'prontuario.html' + consulta;
    document.getElementById('link-novo-exame').href = 'exame-form.html' + consulta;

    // Cria o conteúdo da célula com o resultado e o nome do laudo.
    function celulaDeResultado(registro) {
        const partes = [registro.resultado];
        if (registro.arquivoNome) {
            partes.push(el('br'));
            partes.push(el('small', { classe: 'dica', texto: 'Laudo: ' + registro.arquivoNome }));
        }
        return el('span', {}, partes);
    }

    // Cria os controles para editar ou remover um exame.
    function celulaDeAcoes(registro) {
        return el('div', { classe: 'acoes' }, [
            el('a', { href: 'exame-form.html?id=' + encodeURIComponent(registro.id), texto: 'Editar' }),
            el('button', {
                type: 'button',
                texto: 'Remover',
                onclick:
                    // Remove o exame associado ao botão.
                    function () { remover(registro); }
            })
        ]);
    }

    // Desenha na tabela os exames ordenados por data.
    function desenhar() {
        const lista = SH.util.ordenarRecentes(SH.exames.listarPorPaciente(paciente.id));

        if (lista.length === 0) {
            SH.ui.linhaVazia(corpo, 4, 'Nenhum exame registrado para este paciente.');
            return;
        }

        SH.ui.limpar(corpo);
        lista.forEach(
            // Adiciona uma linha para cada exame.
            function (registro) {
                corpo.appendChild(SH.ui.linha([
                    SH.util.formatarData(registro.data),
                    registro.tipo,
                    celulaDeResultado(registro),
                    celulaDeAcoes(registro)
                ]));
            }
        );
    }

    // Confirma e remove um exame da lista.
    function remover(registro) {
        const confirmado = window.confirm(
            'Remover o exame "' + registro.tipo + '" de ' + SH.util.formatarData(registro.data) + '?\n\n' +
            'Esta ação não pode ser desfeita.'
        );
        if (!confirmado) {
            return;
        }

        try {
            SH.exames.remover(registro.id);
            desenhar();
            SH.ui.avisar('Exame removido.', 'sucesso');
        } catch (erro) {
            SH.ui.avisar(erro.message, 'erro');
        }
    }

    desenhar();
});
