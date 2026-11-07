/* ==========================================================
   dashboard.js - Visão geral (html/dashboard.html)
   Mostra os totais e os cinco registros mais recentes.
   ========================================================== */
SH.pagina(function () {
    'use strict';

    const el = SH.ui.el;
    const pacientes = SH.pacientes.listar();
    const consultas = SH.consultas.listarDoMedico();
    const exames = SH.exames.listarDoMedico();

    const pacientePorId = {};
    pacientes.forEach(function (paciente) {
        pacientePorId[paciente.id] = paciente;
    });

    // Só acrescenta o tratamento se o nome cadastrado ainda não o trouxer (Dr., Dra.)
    const jaTemTratamento = /^dra?\.?\s/i.test(SH.medico.nome);
    document.getElementById('nome-medico').textContent = (jaTemTratamento ? '' : 'Dr(a). ') + SH.medico.nome;
    document.getElementById('total-pacientes').textContent = pacientes.length;
    document.getElementById('total-consultas').textContent = consultas.length;
    document.getElementById('total-exames').textContent = exames.length;

    function linkDoPaciente(pacienteId) {
        const paciente = pacientePorId[pacienteId];
        return el('a', {
            href: 'prontuario.html?paciente=' + encodeURIComponent(pacienteId),
            texto: paciente ? paciente.nome : '-'
        });
    }

    function preencher(corpo, registros, ultimaColuna, textoVazio) {
        if (registros.length === 0) {
            SH.ui.linhaVazia(corpo, 3, textoVazio);
            return;
        }
        SH.ui.limpar(corpo);
        SH.util.ordenarRecentes(registros).slice(0, 5).forEach(function (registro) {
            corpo.appendChild(SH.ui.linha([
                SH.util.formatarData(registro.data),
                linkDoPaciente(registro.pacienteId),
                ultimaColuna(registro)
            ]));
        });
    }

    preencher(
        document.getElementById('ultimas-consultas'),
        consultas,
        function (consulta) { return consulta.motivo; },
        'Nenhuma consulta registrada ainda.'
    );

    preencher(
        document.getElementById('ultimos-exames'),
        exames,
        function (exame) { return exame.tipo; },
        'Nenhum exame registrado ainda.'
    );
});
