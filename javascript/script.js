import api from "./api.js";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.0.8/+esm";

const state = {
    nomeUsuario: ""
};

const DOM = {
    inputField: document.getElementById("inputStyle"),
    btnEnviar: document.getElementById("btn-enviar"),
    btnApagar: document.getElementById("btn-apagar"),
    historico: document.getElementById("historico"),
    divCarregando: document.getElementById("div-carregando"),
    btnSubir: document.getElementById("btn-cima"),
    btnDescer: document.getElementById("btn-baixo"),
};

document.addEventListener("DOMContentLoaded", () => {
    DOM.inputField?.addEventListener("keypress", (event) => {
        if (event.key === "Enter" && !DOM.inputField.disabled) {
            event.preventDefault(); 
            receberMensagem();
        }
    });

    DOM.btnEnviar?.addEventListener("click", (event) => {
        event.preventDefault();
        receberMensagem();
    });

    DOM.btnApagar?.addEventListener("click", (event) => {
        event.preventDefault();
        apagarHistorico();
    });
});

function alternarEstadoCarregando(carregando) {
    const elementos = [DOM.inputField, DOM.btnEnviar];
    
    elementos.forEach(el => {
        if (!el) return;
        el.disabled = carregando;
        el.style.backgroundColor = carregando ? "#696969" : "";
        el.style.cursor = carregando ? "not-allowed" : "pointer";
    });

    if (DOM.divCarregando) {
        DOM.divCarregando.style.display = carregando ? "flex" : "none";
    }
}

function descerTotal() {
    if (DOM.historico) {
        DOM.historico.scrollTo({ top: DOM.historico.scrollHeight, behavior: 'smooth' });
    }
}

function subirTotal() {
    if (DOM.historico) {
        DOM.historico.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function rolarParaBaixo() {
    if (DOM.historico) {
        DOM.historico.scrollTop = DOM.historico.scrollHeight;
    }
}

function exibirErroCampoVazio() {
    DOM.inputField.placeholder = "O campo está vazio!";
    DOM.inputField.style.border = "2px solid var(--danger)";
    
    setTimeout(() => {
        DOM.inputField.style.border = "none";
        DOM.inputField.placeholder = "Digite sua dúvida aqui...";
    }, 2000); 
}

async function receberMensagem() {
    if (!state.nomeUsuario) {
        state.nomeUsuario = prompt("Bem-vindo! Para começarmos, qual é o seu nome?") || `Visitante_${Math.floor(Math.random() * 1000)}`;
    }

    const textoMensagem = DOM.inputField.value.trim();

    if (!textoMensagem) {
        return exibirErroCampoVazio(); 
    }

    DOM.inputField.style.border = "none";
    alternarEstadoCarregando(true);

    try {
        const response = await api.post('/gerar-resposta', {
            usuario: state.nomeUsuario,
            mensagem: textoMensagem
        });
        
        mostrarMensagem(textoMensagem, response.data.resposta.resposta); 
        DOM.inputField.value = "";
    } catch (error) {
        console.error("Erro na requisição: ", error);
        mostrarMensagem(textoMensagem, "Desculpe, ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde!");
        DOM.inputField.value = "";
    } finally {
        alternarEstadoCarregando(false);
        DOM.inputField.focus(); 
    }
}

function mostrarMensagem(pergunta, resposta) {

    const boxMinhasMensagem = document.createElement("div");
    boxMinhasMensagem.className = "box-minhas-mensagem";
    const minhaMensagem = document.createElement("div"); 
    minhaMensagem.className = "minha-mensagem";
    minhaMensagem.textContent = pergunta;
    boxMinhasMensagem.appendChild(minhaMensagem);
    DOM.historico.appendChild(boxMinhasMensagem);


    const respostaFormatada = marked.parse(resposta);
    const boxRespostaDoChat = document.createElement("div");
    boxRespostaDoChat.className = "box-resposta-do-chat";
    const respostaMensagem = document.createElement("div");
    respostaMensagem.className = "resposta-mensagem";
    respostaMensagem.innerHTML = DOMPurify.sanitize(respostaFormatada);
    boxRespostaDoChat.appendChild(respostaMensagem);
    DOM.historico.appendChild(boxRespostaDoChat);

    requestAnimationFrame(rolarParaBaixo);
}

async function apagarHistorico() {
    if (!state.nomeUsuario) return alert("Nenhum usuário cadastrado.");
    if (!confirm("Tem certeza que deseja apagar todo o histórico de conversas?")) return;

    try {
        await api.delete(`/historico/${encodeURIComponent(state.nomeUsuario)}`);
        DOM.historico.innerHTML = ""; 
        alert("Histórico excluído com sucesso!");
    } catch (error) {
        if (error.response?.status === 404) {
            alert("Não havia histórico para apagar.");
        } else {
            console.error("Erro ao excluir: ", error);
            alert("Ocorreu um erro ao excluir o histórico.");
        }
    }
}