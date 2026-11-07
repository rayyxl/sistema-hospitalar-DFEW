/* ==========================================================
   global.js - Recursos compartilhados por todas as páginas
   - Guarda de acesso (login obrigatório nas páginas restritas)
    - Funções utilitárias (datas e máscaras)
   - Avisos na tela e construção segura de elementos
   - Senha com hash (Web Crypto)

   Cada <body> declara o tipo de página em data-acesso:
     data-acesso="publico"  -> login e cadastro (quem já entrou vai ao dashboard)
     data-acesso="restrito" -> demais páginas (quem não entrou volta ao login)

   Autor: Rai Soares
   ========================================================== */
(function () {
    'use strict';

    const SH = window.SH;

    // Caminho até a raiz do projeto ('' em index.html, '../' em html/*.html),
    // deduzido do próprio src deste script.
    const script = document.currentScript;
    SH.raiz = script ? script.getAttribute('src').replace('js/global.js', '') : '';

    /* ---------- Guarda de acesso ---------- */

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

    /* ---------- Utilitários ---------- */

    function digitos(texto) {
        return String(texto || '').replace(/\D/g, '');
    }

    SH.util = {
        digitos: digitos,

        // Lê um parâmetro da URL (ex.: ?paciente=abc123)
        parametro(nome) {
            return new URLSearchParams(window.location.search).get(nome);
        },

        // '2026-10-22' -> '22/10/2026'
        formatarData(iso) {
            const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
            return partes ? partes[3] + '/' + partes[2] + '/' + partes[1] : '-';
        },

        // Data de hoje no formato do <input type="date">
        dataDeHoje() {
            const hoje = new Date();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            return hoje.getFullYear() + '-' + mes + '-' + dia;
        },

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

        // Minúsculas e sem acentos, para buscas
        normalizar(texto) {
            return String(texto || '')
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .toLowerCase();
        },

        // Do mais recente para o mais antigo (data e, se houver, horário)
        ordenarRecentes(lista) {
            return lista.slice().sort(function (a, b) {
                return (b.data + (b.horario || '')).localeCompare(a.data + (a.horario || ''));
            });
        },

        mascaraCpf(valor) {
            const d = digitos(valor).slice(0, 11);
            let resultado = d.slice(0, 3);
            if (d.length > 3) { resultado += '.' + d.slice(3, 6); }
            if (d.length > 6) { resultado += '.' + d.slice(6, 9); }
            if (d.length > 9) { resultado += '-' + d.slice(9, 11); }
            return resultado;
        },

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
            const corte = d.length > 10 ? 5 : 4; // celular tem 9 dígitos
            if (resto.length <= corte) {
                return '(' + ddd + ') ' + resto;
            }
            return '(' + ddd + ') ' + resto.slice(0, corte) + '-' + resto.slice(corte);
        },

    };

    /* ---------- Construção de elementos (sem innerHTML, evita injeção de HTML) ---------- */

    // el('a', { href: '...', texto: 'Abrir', onclick: fn }, [filhos])
    function el(tag, propriedades, filhos) {
        const no = document.createElement(tag);
        Object.keys(propriedades || {}).forEach(function (chave) {
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
        });
        (filhos || []).forEach(function (filho) {
            if (filho === null || filho === undefined) {
                return;
            }
            no.appendChild(typeof filho === 'object' ? filho : document.createTextNode(String(filho)));
        });
        return no;
    }

    function limpar(no) {
        while (no.firstChild) {
            no.removeChild(no.firstChild);
        }
    }

    /* ---------- Avisos na tela ---------- */

    function limparAvisos() {
        document.querySelectorAll('.aviso').forEach(function (aviso) {
            aviso.remove();
        });
    }

    // mensagem: texto ou lista de textos | tipo: 'sucesso' ou 'erro'
    function avisar(mensagem, tipo) {
        limparAvisos();
        tipo = tipo || 'sucesso';

        const conteudo = Array.isArray(mensagem) && mensagem.length > 1
            ? [el('ul', {}, mensagem.map(function (texto) { return el('li', { texto: texto }); }))]
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

    // Guarda um aviso para ser exibido na próxima página (depois de um redirecionamento)
    function avisarDepois(mensagem, tipo) {
        try {
            sessionStorage.setItem('sh_aviso', JSON.stringify({ mensagem: mensagem, tipo: tipo }));
        } catch (erro) {
            /* sem sessionStorage: o aviso simplesmente não aparece */
        }
    }

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
            /* aviso inválido: ignora */
        }
    }

    /* ---------- Ajudantes de tabela e formulário ---------- */

    // Linha de tabela a partir de uma lista de textos ou elementos
    function linha(celulas) {
        return el('tr', {}, celulas.map(function (celula) {
            return el('td', {}, [celula]);
        }));
    }

    // Mensagem de "lista vazia" ocupando a tabela inteira
    function linhaVazia(corpo, colunas, texto) {
        limpar(corpo);
        corpo.appendChild(el('tr', {}, [
            el('td', { classe: 'vazio', colspan: String(colunas), texto: texto })
        ]));
    }

    // Máscaras automáticas nos campos com data-mascara="cpf" ou "telefone"
    function ligarMascaras(escopo) {
        const funcoes = { cpf: SH.util.mascaraCpf, telefone: SH.util.mascaraTelefone };
        (escopo || document).querySelectorAll('[data-mascara]').forEach(function (campo) {
            const aplicar = funcoes[campo.dataset.mascara];
            if (!aplicar) {
                return;
            }
            campo.addEventListener('input', function () {
                campo.value = aplicar(campo.value);
            });
        });
    }

    // Preenche um <select> com os pacientes do médico; devolve quantos existem
    function preencherSelectPacientes(select, selecionadoId) {
        const pacientes = SH.pacientes.listar().sort(function (a, b) {
            return a.nome.localeCompare(b.nome, 'pt-BR');
        });
        limpar(select);
        select.appendChild(el('option', { value: '', texto: 'Selecione o paciente' }));
        pacientes.forEach(function (paciente) {
            select.appendChild(el('option', { value: paciente.id, texto: paciente.nome }));
        });
        if (selecionadoId && pacientes.some(function (p) { return p.id === selecionadoId; })) {
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

    /* ---------- Senha: hash SHA-256 com sal (Web Crypto) ---------- */

    async function resumo(texto) {
        if (!(window.crypto && window.crypto.subtle)) {
            throw new Error('Este navegador não oferece a criptografia necessária. Abra o sistema por localhost ou HTTPS (ex.: extensão Live Server).');
        }
        const bytes = new TextEncoder().encode(texto);
        const hash = await window.crypto.subtle.digest('SHA-256', bytes);
        return Array.from(new Uint8Array(hash))
            .map(function (b) { return b.toString(16).padStart(2, '0'); })
            .join('');
    }

    SH.auth = {
        // Formato guardado: sha256$<sal>$<hash>
        async gerarHash(senha) {
            const sal = SH.novoId();
            return 'sha256$' + sal + '$' + (await resumo(sal + senha));
        },
        async conferir(senha, guardado) {
            const partes = String(guardado || '').split('$');
            if (partes[0] !== 'sha256' || partes.length !== 3) {
                return false;
            }
            return (await resumo(partes[1] + senha)) === partes[2];
        }
    };

    /* ---------- Inicialização das páginas ---------- */

    // Cada página chama SH.pagina(function () { ... }). A função só roda
    // se o acesso foi autorizado, depois que o HTML foi carregado.
    SH.pagina = function (inicio) {
        if (!SH.autorizado) {
            return;
        }
        function rodar() {
            document.querySelectorAll('[data-sair]').forEach(function (link) {
                link.addEventListener('click', function (evento) {
                    evento.preventDefault();
                    SH.sessao.encerrar();
                    window.location.href = SH.raiz + 'index.html';
                });
            });
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
