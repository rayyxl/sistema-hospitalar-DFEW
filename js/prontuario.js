// Carrega os dados cadastrais e o histórico clínico do paciente.
SH.pagina(function () {
    'use strict';

    const el = SH.ui.el;
    const paciente = SH.pacientes.buscar(SH.util.parametro('paciente'));

    if (!paciente) {
        SH.ui.avisarDepois('Paciente não encontrado. Escolha um paciente da lista.', 'erro');
        window.location.replace('pacientes.html');
        return;
    }

    const consultas = SH.util.ordenarRecentes(SH.consultas.listarPorPaciente(paciente.id));
    const exames = SH.util.ordenarRecentes(SH.exames.listarPorPaciente(paciente.id));
    const consulta = '?paciente=' + encodeURIComponent(paciente.id);

    document.title = 'Prontuário de ' + paciente.nome + ' | Sistema Hospitalar';
    document.getElementById('nome-paciente').textContent = paciente.nome;
    document.getElementById('link-editar-paciente').href = 'paciente-editar.html?id=' + encodeURIComponent(paciente.id);
    document.getElementById('link-consultas').href = 'consultas.html' + consulta;
    document.getElementById('link-nova-consulta').href = 'consulta-form.html' + consulta;
    document.getElementById('link-exames').href = 'exames.html' + consulta;
    document.getElementById('link-novo-exame').href = 'exame-form.html' + consulta;

    const rotulosSexo = { feminino: 'Feminino', masculino: 'Masculino', outro: 'Outro' };
    const idade = SH.util.calcularIdade(paciente.nascimento);
    const nascimento = SH.util.formatarData(paciente.nascimento) + (idade !== null ? ' (' + idade + ' anos)' : '');

    const dados = [
        ['Nome', paciente.nome],
        ['CPF', paciente.cpf],
        ['Nascimento', nascimento],
        ['Sexo', rotulosSexo[paciente.sexo] || '-'],
        ['Tipo sanguíneo', paciente.sangue || '-'],
        ['Telefone', paciente.telefone || '-'],
        ['E-mail', paciente.email || '-'],
        ['Endereço', paciente.endereco || '-'],
        ['Alergias', paciente.alergias || 'Nenhuma informada']
    ];

    const corpoDados = document.getElementById('dados-paciente');
    SH.ui.limpar(corpoDados);
    dados.forEach(
        // Adiciona uma linha para cada dado cadastral.
        function (par) {
            corpoDados.appendChild(el('tr', {}, [
                el('th', { texto: par[0] }),
                el('td', { texto: par[1] })
            ]));
        }
    );

    const eventos = consultas.map(
        // Converte uma consulta em item do histórico clínico.
        function (c) {
            return { data: c.data, horario: c.horario, texto: 'Consulta: ' + c.motivo };
        }
    ).concat(exames.map(
        // Converte um exame em item do histórico clínico.
        function (e) {
            return { data: e.data, horario: '', texto: 'Exame: ' + e.tipo };
        }
    ));

    const historico = document.getElementById('historico');
    SH.ui.limpar(historico);
    if (eventos.length === 0) {
        historico.appendChild(el('li', { classe: 'vazio', texto: 'Nenhum registro clínico ainda.' }));
    } else {
        SH.util.ordenarRecentes(eventos).forEach(
            // Adiciona cada evento clínico à lista do histórico.
            function (evento) {
                historico.appendChild(el('li', { texto: SH.util.formatarData(evento.data) + ' - ' + evento.texto }));
            }
        );
    }

    const corpoConsultas = document.getElementById('lista-consultas');
    if (consultas.length === 0) {
        SH.ui.linhaVazia(corpoConsultas, 2, 'Nenhuma consulta registrada.');
    } else {
        SH.ui.limpar(corpoConsultas);
        consultas.forEach(
            // Adiciona uma linha para cada consulta.
            function (c) {
                corpoConsultas.appendChild(SH.ui.linha([SH.util.formatarData(c.data), c.motivo]));
            }
        );
    }

    const corpoExames = document.getElementById('lista-exames');
    if (exames.length === 0) {
        SH.ui.linhaVazia(corpoExames, 2, 'Nenhum exame registrado.');
    } else {
        SH.ui.limpar(corpoExames);
        exames.forEach(
            // Adiciona uma linha para cada exame.
            function (e) {
                corpoExames.appendChild(SH.ui.linha([SH.util.formatarData(e.data), e.tipo]));
            }
        );
    }

    document.getElementById('observacoes-gerais').textContent =
        paciente.observacoes || 'Nenhuma observação registrada.';
});
