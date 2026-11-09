// Carrega os totais e os registros recentes do médico.
SH.pagina(function () {
    'use strict';

    const el = SH.ui.el;
    const pacientes = SH.pacientes.listar();
    const consultas = SH.consultas.listarDoMedico();
    const exames = SH.exames.listarDoMedico();

    const pacientePorId = {};
    pacientes.forEach(
        // Indexa cada paciente pelo identificador.
        function (paciente) {
            pacientePorId[paciente.id] = paciente;
        }
    );

    const jaTemTratamento = /^dra?\.?\s/i.test(SH.medico.nome);
    document.getElementById('nome-medico').textContent = (jaTemTratamento ? '' : 'Dr(a). ') + SH.medico.nome;
    document.getElementById('total-pacientes').textContent = pacientes.length;
    document.getElementById('total-consultas').textContent = consultas.length;
    document.getElementById('total-exames').textContent = exames.length;

    // Cria um link para o prontuário do paciente.
    function linkDoPaciente(pacienteId) {
        const paciente = pacientePorId[pacienteId];
        return el('a', {
            href: 'prontuario.html?paciente=' + encodeURIComponent(pacienteId),
            texto: paciente ? paciente.nome : '-'
        });
    }

    // Exibe os registros recentes em uma tabela ou uma mensagem vazia.
    function preencher(corpo, registros, ultimaColuna, textoVazio) {
        if (registros.length === 0) {
            SH.ui.linhaVazia(corpo, 3, textoVazio);
            return;
        }
        SH.ui.limpar(corpo);
        SH.util.ordenarRecentes(registros).slice(0, 5).forEach(
            // Adiciona uma linha para cada registro recente.
            function (registro) {
                corpo.appendChild(SH.ui.linha([
                    SH.util.formatarData(registro.data),
                    linkDoPaciente(registro.pacienteId),
                    ultimaColuna(registro)
                ]));
            }
        );
    }

    preencher(
        document.getElementById('ultimas-consultas'),
        consultas,
        // Retorna o motivo para a última coluna da tabela de consultas.
        function (consulta) { return consulta.motivo; },
        'Nenhuma consulta registrada ainda.'
    );

    preencher(
        document.getElementById('ultimos-exames'),
        exames,
        // Retorna o tipo para a última coluna da tabela de exames.
        function (exame) { return exame.tipo; },
        'Nenhum exame registrado ainda.'
    );
});
