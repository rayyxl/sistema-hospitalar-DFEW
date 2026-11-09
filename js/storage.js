// Isola a camada de armazenamento e registra seus serviços no objeto SH.
(function () {
    'use strict';

    const SH = (window.SH = window.SH || {});

    const CHAVES = {
        medicos: 'sh_medicos',
        pacientes: 'sh_pacientes',
        consultas: 'sh_consultas',
        exames: 'sh_exames',
        sessao: 'sh_sessao'
    };

    // Lê e interpreta um valor do armazenamento ou retorna o padrão.
    function ler(chave, padrao) {
        try {
            const bruto = localStorage.getItem(chave);
            return bruto === null ? padrao : JSON.parse(bruto);
        } catch (erro) {
            return padrao;
        }
    }

    // Serializa e grava um valor no armazenamento local.
    function gravar(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
        } catch (erro) {
            throw new Error('Não foi possível salvar os dados no navegador. Verifique se o armazenamento está liberado e se há espaço disponível.');
        }
    }

    // Gera um identificador único para um novo registro.
    function novoId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    SH.novoId = novoId;

    // Cria operações de leitura, gravação e remoção para uma coleção.
    function colecao(chave) {
        return {
            // Retorna todos os registros da coleção.
            todos() {
                const dados = ler(chave, []);
                return Array.isArray(dados) ? dados : [];
            },

            // Busca um registro pelo identificador.
            buscar(id) {
                return this.todos().find(
                    // Compara o identificador de cada registro.
                    (item) => item.id === id
                ) || null;
            },

            // Cria ou atualiza um registro e retorna o valor salvo.
            salvar(item) {
                const itens = this.todos();
                let resultado = item;

                if (!item.id) {
                    item.id = novoId();
                    item.criadoEm = new Date().toISOString();
                    itens.push(item);
                } else {
                    const posicao = itens.findIndex(
                        // Localiza o registro que será atualizado.
                        (existente) => existente.id === item.id
                    );
                    if (posicao === -1) {
                        itens.push(item);
                    } else {
                        itens[posicao] = Object.assign({}, itens[posicao], item);
                        resultado = itens[posicao];
                    }
                }

                gravar(chave, itens);
                return resultado;
            },

            // Remove da coleção o registro com o identificador informado.
            remover(id) {
                gravar(chave, this.todos().filter(
                    // Mantém todos os registros com outro identificador.
                    (item) => item.id !== id
                ));
            },

            // Remove os registros que atendem à condição recebida.
            removerOnde(condicao) {
                gravar(chave, this.todos().filter(
                    // Mantém os registros que não atendem à condição.
                    (item) => !condicao(item)
                ));
            }
        };
    }

    const bd = {
        medicos: colecao(CHAVES.medicos),
        pacientes: colecao(CHAVES.pacientes),
        consultas: colecao(CHAVES.consultas),
        exames: colecao(CHAVES.exames)
    };

    // Retorna o identificador do médico registrado na sessão atual.
    function idDoMedicoLogado() {
        const sessao = ler(CHAVES.sessao, null);
        return sessao && sessao.medicoId ? sessao.medicoId : null;
    }

    SH.sessao = {
        // Retorna os dados do médico autenticado, se houver.
        medicoAtual() {
            const id = idDoMedicoLogado();
            return id ? bd.medicos.buscar(id) : null;
        },
        // Registra o médico como autenticado.
        iniciar(medicoId) {
            gravar(CHAVES.sessao, { medicoId: medicoId, entrouEm: new Date().toISOString() });
        },
        // Remove os dados da sessão atual.
        encerrar() {
            try {
                localStorage.removeItem(CHAVES.sessao);
            } catch (erro) {
            }
        }
    };

    SH.medicos = {
        // Retorna a quantidade de médicos cadastrados.
        total() {
            return bd.medicos.todos().length;
        },
        // Busca um médico pelo e-mail normalizado.
        buscarPorEmail(email) {
            const alvo = String(email || '').trim().toLowerCase();
            return bd.medicos.todos().find(
                // Compara o e-mail de cada médico.
                (medico) => medico.email === alvo
            ) || null;
        },
        // Normaliza o e-mail e cadastra o médico se ainda não existir.
        criar(dados) {
            dados.email = String(dados.email || '').trim().toLowerCase();
            if (this.buscarPorEmail(dados.email)) {
                throw new Error('Já existe um médico cadastrado com este e-mail.');
            }
            return bd.medicos.salvar(dados);
        }
    };

    SH.pacientes = {
        // Lista os pacientes pertencentes ao médico autenticado.
        listar() {
            const medicoId = idDoMedicoLogado();
            return bd.pacientes.todos().filter(
                // Mantém os pacientes associados ao médico atual.
                (paciente) => paciente.medicoId === medicoId
            );
        },

        // Busca um paciente somente se pertencer ao médico autenticado.
        buscar(id) {
            const paciente = bd.pacientes.buscar(id);
            return paciente && paciente.medicoId === idDoMedicoLogado() ? paciente : null;
        },

        // Busca outro paciente com o CPF informado, ignorando um ID opcional.
        buscarPorCpf(cpf, ignorarId) {
            return this.listar().find(
                // Compara o CPF e ignora o registro solicitado.
                (p) => p.cpf === cpf && p.id !== ignorarId
            ) || null;
        },

        // Associa o paciente ao médico atual e salva os dados.
        salvar(dados) {
            if (dados.id && !this.buscar(dados.id)) {
                throw new Error('Paciente não encontrado.');
            }
            dados.medicoId = idDoMedicoLogado();
            return bd.pacientes.salvar(dados);
        },

        // Remove o paciente e também suas consultas e seus exames.
        remover(id) {
            if (!this.buscar(id)) {
                return;
            }
            bd.consultas.removerOnde(
                // Seleciona as consultas vinculadas ao paciente.
                (consulta) => consulta.pacienteId === id
            );
            bd.exames.removerOnde(
                // Seleciona os exames vinculados ao paciente.
                (exame) => exame.pacienteId === id
            );
            bd.pacientes.remover(id);
        }
    };

    // Cria operações para registros vinculados aos pacientes do médico atual.
    function registrosDoPaciente(colecaoBase, mensagemNaoEncontrado) {
        return {
            // Lista os registros do paciente se ele pertencer ao médico atual.
            listarPorPaciente(pacienteId) {
                return SH.pacientes.buscar(pacienteId)
                    ? colecaoBase.todos().filter(
                        // Mantém os registros vinculados ao paciente informado.
                        (registro) => registro.pacienteId === pacienteId
                    )
                    : [];
            },

            // Lista todos os registros associados aos pacientes do médico.
            listarDoMedico() {
                const ids = new Set(SH.pacientes.listar().map(
                    // Extrai o identificador de cada paciente.
                    (paciente) => paciente.id
                ));
                return colecaoBase.todos().filter(
                    // Mantém registros associados aos pacientes encontrados.
                    (registro) => ids.has(registro.pacienteId)
                );
            },

            // Busca um registro se o paciente associado for do médico atual.
            buscar(id) {
                const registro = colecaoBase.buscar(id);
                return registro && SH.pacientes.buscar(registro.pacienteId) ? registro : null;
            },

            // Salva o registro se o paciente e, na edição, o registro existirem.
            salvar(dados) {
                if (!SH.pacientes.buscar(dados.pacienteId)) {
                    throw new Error('Paciente não encontrado.');
                }
                if (dados.id && !this.buscar(dados.id)) {
                    throw new Error(mensagemNaoEncontrado);
                }
                return colecaoBase.salvar(dados);
            },

            // Remove o registro se estiver acessível ao médico atual.
            remover(id) {
                if (this.buscar(id)) {
                    colecaoBase.remover(id);
                }
            }
        };
    }

    SH.consultas = registrosDoPaciente(bd.consultas, 'Consulta não encontrada.');
    SH.exames = registrosDoPaciente(bd.exames, 'Exame não encontrado.');
})();
