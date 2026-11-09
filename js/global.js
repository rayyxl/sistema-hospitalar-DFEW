// Isola as variáveis e inicializa os recursos compartilhados do sistema.
(function () {
    'use strict';

    const SH = window.SH;

    const script = document.currentScript;
    SH.raiz = script ? script.getAttribute('src').replace('js/global.js', '') : '';

    const acesso = document.body.dataset.acesso || 'restrito';
    SH.medico = SH.sessao.medicoAtual();
    SH.autorizado = true;

    if (acesso === 'restrito' && !SH.medico) {
        SH.autorizado = false;
        window.location.replace(SH.raiz + 'index.html');
    } else if (acesso === 'publico' && SH.medico) {
        SH.autorizado = false;
        window.location.replace(SH.raiz + 'html/dashboard.html');
    }

    // Retorna apenas os dígitos de um texto.
    function digitos(texto) {
        return String(texto || '').replace(/\D/g, '');
    }

    SH.util = {
        digitos: digitos,

        // Retorna o valor de um parâmetro da URL.
        parametro(nome) {
            return new URLSearchParams(window.location.search).get(nome);
        },

        // Converte uma data ISO para o formato dia/mês/ano.
        formatarData(iso) {
            const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
            return partes ? partes[3] + '/' + partes[2] + '/' + partes[1] : '-';
        },

        // Retorna a data atual no formato aceito por campos date.
        dataDeHoje() {
            const hoje = new Date();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            return hoje.getFullYear() + '-' + mes + '-' + dia;
        },

        // Calcula a idade a partir de uma data de nascimento ISO.
        calcularIdade(iso) {
            const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
            if (!partes) {
                return null;
            }
            const hoje = new Date();
            let idade = hoje.getFullYear() - Number(partes[1]);
            const antesDoAniversario =
                hoje.getMonth() + 1 < Number(partes[2]) ||
                (hoje.getMonth() + 1 === Number(partes[2]) && hoje.getDate() < Number(partes[3]));
            if (antesDoAniversario) {
                idade -= 1;
            }
            return idade >= 0 ? idade : null;
        },

        // Remove acentos e converte o texto para minúsculas.
        normalizar(texto) {
            return String(texto || '')
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .toLowerCase();
        },

        // Retorna uma cópia da lista ordenada dos registros mais recentes.
        ordenarRecentes(lista) {
            return lista.slice().sort(
                // Compara os registros pela data e pelo horário.
                function (a, b) {
                    return (b.data + (b.horario || '')).localeCompare(a.data + (a.horario || ''));
                }
            );
        },

        // Formata uma sequência de dígitos como CPF.
        mascaraCpf(valor) {
            const d = digitos(valor).slice(0, 11);
            let resultado = d.slice(0, 3);
            if (d.length > 3) { resultado += '.' + d.slice(3, 6); }
            if (d.length > 6) { resultado += '.' + d.slice(6, 9); }
            if (d.length > 9) { resultado += '-' + d.slice(9, 11); }
            return resultado;
        },

        // Formata o CRM como número/UF, limitando os dígitos e as letras.
        mascaraCrm(valor) {
            const texto = String(valor || '').toUpperCase();
            const numero = digitos(texto).slice(0, 7);
            const uf = texto.replace(/[^A-Z]/g, '').slice(0, 2);
            if (!numero) {
                return '';
            }
            return numero + (uf.length > 0 || texto.includes('/') ? '/' : '') + uf;
        },

        // Formata uma sequência de dígitos como telefone brasileiro.
        mascaraTelefone(valor) {
            const d = digitos(valor).slice(0, 11);
            if (d.length === 0) {
                return '';
            }
            if (d.length <= 2) {
                return '(' + d;
            }
            const ddd = d.slice(0, 2);
            const resto = d.slice(2);
            const corte = d.length > 10 ? 5 : 4;
            if (resto.length <= corte) {
                return '(' + ddd + ') ' + resto;
            }
            return '(' + ddd + ') ' + resto.slice(0, corte) + '-' + resto.slice(corte);
        },

    };

    // Cria um elemento HTML com propriedades, eventos e filhos.
    function el(tag, propriedades, filhos) {
        const no = document.createElement(tag);
        Object.keys(propriedades || {}).forEach(
            // Aplica ao elemento cada propriedade recebida.
            function (chave) {
                const valor = propriedades[chave];
                if (valor === null || valor === undefined || valor === false) {
                    return;
                }
                if (chave === 'texto') {
                    no.textContent = valor;
                } else if (chave === 'classe') {
                    no.className = valor;
                } else if (chave.slice(0, 2) === 'on' && typeof valor === 'function') {
                    no.addEventListener(chave.slice(2), valor);
                } else {
                    no.setAttribute(chave, valor === true ? '' : valor);
                }
            }
        );
        (filhos || []).forEach(
            // Adiciona cada filho válido ao elemento criado.
            function (filho) {
                if (filho === null || filho === undefined) {
                    return;
                }
                no.appendChild(typeof filho === 'object' ? filho : document.createTextNode(String(filho)));
            }
        );
        return no;
    }

    // Remove todos os filhos de um elemento.
    function limpar(no) {
        while (no.firstChild) {
            no.removeChild(no.firstChild);
        }
    }

    // Remove da página todos os avisos exibidos.
    function limparAvisos() {
        document.querySelectorAll('.aviso').forEach(
            // Exclui um aviso da página.
            function (aviso) {
                aviso.remove();
            }
        );
    }

    // Exibe uma mensagem de sucesso ou erro na página.
    function avisar(mensagem, tipo) {
        limparAvisos();
        tipo = tipo || 'sucesso';

        const conteudo = Array.isArray(mensagem) && mensagem.length > 1
            ? [el('ul', {}, mensagem.map(
                // Cria um item de lista para cada mensagem.
                function (texto) { return el('li', { texto: texto }); }
            ))]
            : [Array.isArray(mensagem) ? mensagem[0] : mensagem];

        const aviso = el('div', {
            classe: 'aviso aviso-' + tipo,
            role: tipo === 'erro' ? 'alert' : 'status'
        }, conteudo);

        const titulo = document.querySelector('main h2');
        if (titulo) {
            titulo.insertAdjacentElement('afterend', aviso);
        } else {
            document.querySelector('main').prepend(aviso);
        }
        aviso.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Guarda um aviso para ser exibido na próxima página.
    function avisarDepois(mensagem, tipo) {
        try {
            sessionStorage.setItem('sh_aviso', JSON.stringify({ mensagem: mensagem, tipo: tipo }));
        } catch (erro) {
        }
    }

    // Lê e exibe o aviso guardado para a página atual.
    function mostrarAvisoPendente() {
        try {
            const bruto = sessionStorage.getItem('sh_aviso');
            if (!bruto) {
                return;
            }
            sessionStorage.removeItem('sh_aviso');
            const aviso = JSON.parse(bruto);
            avisar(aviso.mensagem, aviso.tipo);
        } catch (erro) {
        }
    }

    // Cria uma linha de tabela com as células recebidas.
    function linha(celulas) {
        return el('tr', {}, celulas.map(
            // Cria uma célula de tabela para cada valor.
            function (celula) {
                return el('td', {}, [celula]);
            }
        ));
    }

    // Exibe uma mensagem de lista vazia na tabela.
    function linhaVazia(corpo, colunas, texto) {
        limpar(corpo);
        corpo.appendChild(el('tr', {}, [
            el('td', { classe: 'vazio', colspan: String(colunas), texto: texto })
        ]));
    }

    // Aplica máscaras de CPF e telefone aos campos correspondentes.
    function ligarMascaras(escopo) {
        const funcoes = {
            cpf: SH.util.mascaraCpf,
            crm: SH.util.mascaraCrm,
            telefone: SH.util.mascaraTelefone
        };
        (escopo || document).querySelectorAll('[data-mascara]').forEach(
            // Configura a máscara indicada em cada campo.
            function (campo) {
                const aplicar = funcoes[campo.dataset.mascara];
                if (!aplicar) {
                    return;
                }
                campo.addEventListener('input',
                    // Atualiza o valor do campo enquanto o usuário digita.
                    function () {
                        campo.value = aplicar(campo.value);
                    }
                );
            }
        );
    }

    // Preenche um seletor com os pacientes do médico e retorna a quantidade.
    function preencherSelectPacientes(select, selecionadoId) {
        const pacientes = SH.pacientes.listar().sort(
            // Ordena os pacientes pelo nome.
            function (a, b) {
                return a.nome.localeCompare(b.nome, 'pt-BR');
            }
        );
        limpar(select);
        select.appendChild(el('option', { value: '', texto: 'Selecione o paciente' }));
        pacientes.forEach(
            // Adiciona uma opção para cada paciente.
            function (paciente) {
                select.appendChild(el('option', { value: paciente.id, texto: paciente.nome }));
            }
        );
        if (selecionadoId && pacientes.some(
            // Verifica se o paciente selecionado ainda está disponível.
            function (p) { return p.id === selecionadoId; }
        )) {
            select.value = selecionadoId;
        }
        return pacientes.length;
    }

    SH.ui = {
        el: el,
        limpar: limpar,
        avisar: avisar,
        limparAvisos: limparAvisos,
        avisarDepois: avisarDepois,
        mostrarAvisoPendente: mostrarAvisoPendente,
        linha: linha,
        linhaVazia: linhaVazia,
        ligarMascaras: ligarMascaras,
        preencherSelectPacientes: preencherSelectPacientes
    };

    // Calcula o hash SHA-256 de um texto.
    async function resumo(texto) {
        if (!(window.crypto && window.crypto.subtle)) {
            throw new Error('Este navegador não oferece a criptografia necessária. Abra o sistema por localhost ou HTTPS (ex.: extensão Live Server).');
        }
        const bytes = new TextEncoder().encode(texto);
        const hash = await window.crypto.subtle.digest('SHA-256', bytes);
        return Array.from(new Uint8Array(hash))
            .map(
                // Converte cada byte do hash para dois dígitos hexadecimais.
                function (b) { return b.toString(16).padStart(2, '0'); }
            )
            .join('');
    }

    SH.auth = {
        // Gera um hash de senha com um sal aleatório.
        async gerarHash(senha) {
            const sal = SH.novoId();
            return 'sha256$' + sal + '$' + (await resumo(sal + senha));
        },
        // Confere uma senha usando o hash armazenado.
        async conferir(senha, guardado) {
            const partes = String(guardado || '').split('$');
            if (partes[0] !== 'sha256' || partes.length !== 3) {
                return false;
            }
            return (await resumo(partes[1] + senha)) === partes[2];
        }
    };

    // Executa a inicialização da página após autorizar o acesso e carregar o HTML.
    SH.pagina = function (inicio) {
        if (!SH.autorizado) {
            return;
        }
        // Configura os controles comuns e inicia a página.
        function rodar() {
            document.querySelectorAll('[data-sair]').forEach(
                // Configura o link para encerrar a sessão.
                function (link) {
                    link.addEventListener('click',
                        // Encerra a sessão e retorna à tela de acesso.
                        function (evento) {
                            evento.preventDefault();
                            SH.sessao.encerrar();
                            window.location.href = SH.raiz + 'index.html';
                        }
                    );
                }
            );
            mostrarAvisoPendente();
            inicio();
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', rodar);
        } else {
            rodar();
        }
    };
})();
