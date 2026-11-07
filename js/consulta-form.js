/* ==========================================================
   consulta-form.js - Adicionar e editar consulta (html/consulta-form.html)
     Nova consulta : consulta-form.html            (ou ?paciente=ID para já escolher o paciente)
     Editar        : consulta-form.html?id=ID_DA_CONSULTA
   ========================================================== */
SH.pagina(function () {
    'use strict';

    const form = document.getElementById('form-consulta');
    const campos = form.elements;
    const idDaConsulta = SH.util.parametro('id');
    let consulta = null;
    let pacienteId = SH.util.parametro('paciente');

    if (idDaConsulta) {
        consulta = SH.consultas.buscar(idDaConsulta);
        if (!consulta) {
            SH.ui.avisarDepois('Consulta não encontrada.', 'erro');
            window.location.replace('pacientes.html');
            return;
        }
        pacienteId = consulta.pacienteId;
    }

    const totalPacientes = SH.ui.preencherSelectPacientes(campos.paciente, pacienteId);

    if (totalPacientes === 0) {
        document.getElementById('campos').disabled = true;
        document.getElementById('botao-salvar').disabled = true;
        SH.ui.avisar('Nenhum paciente cadastrado. Cadastre um paciente antes de registrar consultas.', 'erro');
        return;
    }

    // Os links "Voltar" e "Cancelar" levam às consultas do paciente escolhido
    function atualizarLinks() {
        const destino = campos.paciente.value
            ? 'consultas.html?paciente=' + encodeURIComponent(campos.paciente.value)
            : 'pacientes.html';
        document.getElementById('link-voltar').href = destino;
        document.getElementById('link-cancelar').href = destino;
    }
    campos.paciente.addEventListener('change', atualizarLinks);
    atualizarLinks();

    if (consulta) {
        document.getElementById('titulo-form').textContent = 'Editar consulta';
        campos.paciente.disabled = true; // a consulta não muda de paciente
        campos.data.value = consulta.data;
        campos.horario.value = consulta.horario || '';
        campos.motivo.value = consulta.motivo;
        campos.diagnostico.value = consulta.diagnostico || '';
        campos.observacoes.value = consulta.observacoes || '';
        form.querySelector('input[type="reset"]').remove(); // "Limpar" não faz sentido ao editar
    } else {
        // Sugere a data de hoje (e o botão "Limpar" volta para ela)
        campos.data.value = campos.data.defaultValue = SH.util.dataDeHoje();
    }

    form.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const dados = {
            pacienteId: consulta ? consulta.pacienteId : campos.paciente.value,
            data: campos.data.value,
            horario: campos.horario.value,
            motivo: campos.motivo.value.trim().replace(/\s+/g, ' '),
            diagnostico: campos.diagnostico.value.trim(),
            observacoes: campos.observacoes.value.trim()
        };

        const erros = [];
        if (!dados.pacienteId) {
            erros.push('Escolha o paciente.');
        }
        if (dados.motivo.length < 3) {
            erros.push('Descreva o motivo da consulta.');
        }

        if (erros.length > 0) {
            SH.ui.avisar(erros, 'erro');
            return;
        }

        try {
            if (consulta) {
                dados.id = consulta.id;
            }
            SH.consultas.salvar(dados);
            SH.ui.avisarDepois(consulta ? 'Consulta atualizada.' : 'Consulta registrada com sucesso.', 'sucesso');
            window.location.href = 'consultas.html?paciente=' + encodeURIComponent(dados.pacienteId);
        } catch (erro) {
            SH.ui.avisar(erro.message, 'erro');
        }
    });
});
