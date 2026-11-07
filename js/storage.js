/* ==========================================================
   storage.js - Camada de dados do Sistema Hospitalar
   Tudo é guardado no localStorage do navegador, em formato JSON.

   Chaves usadas:
     sh_medicos    -> lista de médicos cadastrados
     sh_pacientes  -> lista de pacientes (cada um pertence a um médico)
     sh_consultas  -> lista de consultas (ligadas a um paciente)
     sh_exames     -> lista de exames (ligados a um paciente)
     sh_sessao     -> médico que está logado no momento

   Autor: Rai Soares
   ========================================================== */
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

    /* ---------- Funções básicas de leitura e gravação ---------- */

    function ler(chave, padrao) {
        try {
            const bruto = localStorage.getItem(chave);
            return bruto === null ? padrao : JSON.parse(bruto);
        } catch (erro) {
            return padrao;
        }
    }

    function gravar(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
        } catch (erro) {
            throw new Error('Não foi possível salvar os dados no navegador. Verifique se o armazenamento está liberado e se há espaço disponível.');
        }
    }

    function novoId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    SH.novoId = novoId;

    /* ---------- Coleção genérica (um "CRUD" simples por chave) ---------- */

    function colecao(chave) {
        return {
            todos() {
                const dados = ler(chave, []);
                return Array.isArray(dados) ? dados : [];
            },

            buscar(id) {
                return this.todos().find((item) => item.id === id) || null;
            },

            // Sem id: cria. Com id: atualiza mesclando os campos novos.
            salvar(item) {
                const itens = this.todos();
                let resultado = item;

                if (!item.id) {
                    item.id = novoId();
                    item.criadoEm = new Date().toISOString();
                    itens.push(item);
                } else {
                    const posicao = itens.findIndex((existente) => existente.id === item.id);
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

            remover(id) {
                gravar(chave, this.todos().filter((item) => item.id !== id));
            },

            removerOnde(condicao) {
                gravar(chave, this.todos().filter((item) => !condicao(item)));
            }
        };
    }

    const bd = {
        medicos: colecao(CHAVES.medicos),
        pacientes: colecao(CHAVES.pacientes),
        consultas: colecao(CHAVES.consultas),
        exames: colecao(CHAVES.exames)
    };

    function idDoMedicoLogado() {
        const sessao = ler(CHAVES.sessao, null);
        return sessao && sessao.medicoId ? sessao.medicoId : null;
    }

    /* ---------- Sessão ---------- */

    SH.sessao = {
        medicoAtual() {
            const id = idDoMedicoLogado();
            return id ? bd.medicos.buscar(id) : null;
        },
        iniciar(medicoId) {
            gravar(CHAVES.sessao, { medicoId: medicoId, entrouEm: new Date().toISOString() });
        },
        encerrar() {
            try {
                localStorage.removeItem(CHAVES.sessao);
            } catch (erro) {
                /* sem acesso ao armazenamento: nada a fazer */
            }
        }
    };

    /* ---------- Médicos ---------- */

    SH.medicos = {
        total() {
            return bd.medicos.todos().length;
        },
        buscarPorEmail(email) {
            const alvo = String(email || '').trim().toLowerCase();
            return bd.medicos.todos().find((medico) => medico.email === alvo) || null;
        },
        criar(dados) {
            dados.email = String(dados.email || '').trim().toLowerCase();
            if (this.buscarPorEmail(dados.email)) {
                throw new Error('Já existe um médico cadastrado com este e-mail.');
            }
            return bd.medicos.salvar(dados);
        }
    };

    /* ---------- Pacientes (sempre filtrados pelo médico logado) ---------- */

    SH.pacientes = {
        listar() {
            const medicoId = idDoMedicoLogado();
            return bd.pacientes.todos().filter((paciente) => paciente.medicoId === medicoId);
        },

        buscar(id) {
            const paciente = bd.pacientes.buscar(id);
            return paciente && paciente.medicoId === idDoMedicoLogado() ? paciente : null;
        },

        buscarPorCpf(cpf, ignorarId) {
            return this.listar().find((p) => p.cpf === cpf && p.id !== ignorarId) || null;
        },

        salvar(dados) {
            if (dados.id && !this.buscar(dados.id)) {
                throw new Error('Paciente não encontrado.');
            }
            dados.medicoId = idDoMedicoLogado();
            return bd.pacientes.salvar(dados);
        },

        // Remove o paciente e, junto, as consultas e os exames dele
        remover(id) {
            if (!this.buscar(id)) {
                return;
            }
            bd.consultas.removerOnde((consulta) => consulta.pacienteId === id);
            bd.exames.removerOnde((exame) => exame.pacienteId === id);
            bd.pacientes.remover(id);
        }
    };

    /* ---------- Consultas e exames (mesma lógica, coleções diferentes) ---------- */

    function registrosDoPaciente(colecaoBase, mensagemNaoEncontrado) {
        return {
            listarPorPaciente(pacienteId) {
                return SH.pacientes.buscar(pacienteId)
                    ? colecaoBase.todos().filter((registro) => registro.pacienteId === pacienteId)
                    : [];
            },

            listarDoMedico() {
                const ids = new Set(SH.pacientes.listar().map((paciente) => paciente.id));
                return colecaoBase.todos().filter((registro) => ids.has(registro.pacienteId));
            },

            buscar(id) {
                const registro = colecaoBase.buscar(id);
                return registro && SH.pacientes.buscar(registro.pacienteId) ? registro : null;
            },

            salvar(dados) {
                if (!SH.pacientes.buscar(dados.pacienteId)) {
                    throw new Error('Paciente não encontrado.');
                }
                if (dados.id && !this.buscar(dados.id)) {
                    throw new Error(mensagemNaoEncontrado);
                }
                return colecaoBase.salvar(dados);
            },

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
