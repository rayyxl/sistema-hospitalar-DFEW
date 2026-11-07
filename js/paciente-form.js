/* ==========================================================
   paciente-form.js - Cadastro e edição de paciente
   Usado por paciente-novo.html (data-modo="novo") e
   paciente-editar.html (data-modo="editar", com ?id=...).
   ========================================================== */
SH.pagina(function () {
    'use strict';

    const form = document.getElementById('form-paciente');
    const campos = form.elements;
    const editando = form.dataset.modo === 'editar';
    let paciente = null;

    SH.ui.ligarMascaras(form);

    function preencherFormulario(dados) {
        campos.nome.value = dados.nome || '';
        campos.cpf.value = dados.cpf || '';
        campos.nascimento.value = dados.nascimento || '';
        campos.sexo.value = dados.sexo || '';
        campos.sangue.value = dados.sangue || '';
        campos.email.value = dados.email || '';
        campos.telefone.value = dados.telefone || '';
        campos.endereco.value = dados.endereco || '';
        campos.alergias.value = dados.alergias || '';
        campos.observacoes.value = dados.observacoes || '';
    }

    if (editando) {
        paciente = SH.pacientes.buscar(SH.util.parametro('id'));
        if (!paciente) {
            SH.ui.avisarDepois('Paciente não encontrado. Escolha um paciente da lista.', 'erro');
            window.location.replace('pacientes.html');
            return;
        }
        preencherFormulario(paciente);
        document.getElementById('nome-paciente').textContent = paciente.nome;
        document.getElementById('link-cancelar').href = 'prontuario.html?paciente=' + encodeURIComponent(paciente.id);
    }

    form.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const dados = {
            nome: campos.nome.value.trim().replace(/\s+/g, ' '),
            cpf: SH.util.mascaraCpf(campos.cpf.value),
            nascimento: campos.nascimento.value,
            sexo: campos.sexo.value,
            sangue: campos.sangue.value,
            email: campos.email.value.trim(),
            telefone: SH.util.mascaraTelefone(campos.telefone.value),
            endereco: campos.endereco.value.trim(),
            alergias: campos.alergias.value.trim(),
            observacoes: campos.observacoes.value.trim()
        };

        const erros = [];
        if (dados.nome.length < 3) {
            erros.push('Informe o nome completo do paciente.');
        }
        if (dados.nascimento > SH.util.dataDeHoje()) {
            erros.push('A data de nascimento não pode estar no futuro.');
        }
        if (SH.util.digitos(dados.telefone).length < 10) {
            erros.push('Informe o telefone com DDD.');
        }

        if (erros.length > 0) {
            SH.ui.avisar(erros, 'erro');
            return;
        }

        try {
            if (paciente) {
                dados.id = paciente.id;
            }
            const salvo = SH.pacientes.salvar(dados);

            if (paciente) {
                SH.ui.avisarDepois('Dados do paciente atualizados.', 'sucesso');
                window.location.href = 'prontuario.html?paciente=' + encodeURIComponent(salvo.id);
            } else {
                SH.ui.avisarDepois('Paciente "' + salvo.nome + '" cadastrado com sucesso.', 'sucesso');
                window.location.href = 'pacientes.html';
            }
        } catch (erro) {
            SH.ui.avisar(erro.message, 'erro');
        }
    });
});
