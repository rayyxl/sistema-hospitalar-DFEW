// Prepara o formulário para criar ou editar um exame.
SH.pagina(function () {
    'use strict';

    const form = document.getElementById('form-exame');
    const campos = form.elements;
    const idDoExame = SH.util.parametro('id');
    let exame = null;
    let pacienteId = SH.util.parametro('paciente');

    if (idDoExame) {
        exame = SH.exames.buscar(idDoExame);
        if (!exame) {
            SH.ui.avisarDepois('Exame não encontrado.', 'erro');
            window.location.replace('pacientes.html');
            return;
        }
        pacienteId = exame.pacienteId;
    }

    const totalPacientes = SH.ui.preencherSelectPacientes(campos.paciente, pacienteId);

    if (totalPacientes === 0) {
        document.getElementById('campos').disabled = true;
        document.getElementById('botao-salvar').disabled = true;
        SH.ui.avisar('Nenhum paciente cadastrado. Cadastre um paciente antes de registrar exames.', 'erro');
        return;
    }

    // Atualiza os links de retorno de acordo com o paciente escolhido.
    function atualizarLinks() {
        const destino = campos.paciente.value
            ? 'exames.html?paciente=' + encodeURIComponent(campos.paciente.value)
            : 'pacientes.html';
        document.getElementById('link-voltar').href = destino;
        document.getElementById('link-cancelar').href = destino;
    }
    campos.paciente.addEventListener('change', atualizarLinks);
    atualizarLinks();

    if (exame) {
        document.getElementById('titulo-form').textContent = 'Editar exame';
        campos.paciente.disabled = true;
        campos.tipo.value = exame.tipo;
        campos.data.value = exame.data;
        campos.resultado.value = exame.resultado;
        campos.observacoes.value = exame.observacoes || '';
        if (exame.arquivoNome) {
            document.getElementById('arquivo-atual').textContent =
                'Arquivo atual: ' + exame.arquivoNome + '. Escolha outro arquivo apenas se quiser substituí-lo (só o nome do arquivo é registrado).';
        }
        form.querySelector('input[type="reset"]').remove();
    } else {
        campos.data.value = campos.data.defaultValue = SH.util.dataDeHoje();
    }

    form.addEventListener('submit',
        // Valida e salva os dados do exame.
        function (evento) {
            evento.preventDefault();

            const novoArquivo = campos.arquivo.files && campos.arquivo.files[0];

            const dados = {
                pacienteId: exame ? exame.pacienteId : campos.paciente.value,
                tipo: campos.tipo.value.trim().replace(/\s+/g, ' '),
                data: campos.data.value,
                resultado: campos.resultado.value.trim(),
                arquivoNome: novoArquivo ? novoArquivo.name : (exame ? exame.arquivoNome || '' : ''),
                observacoes: campos.observacoes.value.trim()
            };

            const erros = [];
            if (!dados.pacienteId) {
                erros.push('Escolha o paciente.');
            }
            if (dados.tipo.length < 3) {
                erros.push('Informe o tipo de exame.');
            }
            if (dados.resultado.length < 2) {
                erros.push('Descreva o resultado do exame.');
            }

            if (erros.length > 0) {
                SH.ui.avisar(erros, 'erro');
                return;
            }

            try {
                if (exame) {
                    dados.id = exame.id;
                }
                SH.exames.salvar(dados);
                SH.ui.avisarDepois(exame ? 'Exame atualizado.' : 'Exame registrado com sucesso.', 'sucesso');
                window.location.href = 'exames.html?paciente=' + encodeURIComponent(dados.pacienteId);
            } catch (erro) {
                SH.ui.avisar(erro.message, 'erro');
            }
        }
    );
});
