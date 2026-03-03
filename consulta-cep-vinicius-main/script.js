// Aguarda o carregamento completo do DOM para adicionar os eventos
document.addEventListener('DOMContentLoaded', () => {
    const radioButtons = document.querySelectorAll('input[name="tipoBusca"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', atualizarPlaceholder);
    });
    // Garante que o placeholder inicial está correto
    atualizarPlaceholder();
});

// Função para atualizar o placeholder do input com base na seleção
function atualizarPlaceholder() {
    const tipoBusca = document.querySelector('input[name="tipoBusca"]:checked').value;
    const searchInput = document.getElementById('searchInput');
    const resultadoDiv = document.getElementById('resultado');

    if (tipoBusca === 'cep') {
        searchInput.placeholder = "Digite o CEP (apenas números)";
    } else {
        searchInput.placeholder = "Digite o CNPJ (apenas números)";
    }
    // Limpa o campo de input e o resultado ao trocar de tipo
    searchInput.value = "";
    resultadoDiv.innerHTML = "";
}

// Função principal que decide qual busca realizar
function realizarBusca() {
    const tipoBusca = document.querySelector('input[name="tipoBusca"]:checked').value;
    if (tipoBusca === 'cep') {
        buscarCEP();
    } else {
        buscarCNPJ();
    }
}

// Função para buscar CEP
function buscarCEP() {
    const cep = document.getElementById('searchInput').value.replace(/\D/g, '');
    const resultadoDiv = document.getElementById('resultado');

    if (cep.length !== 8) {
        resultadoDiv.innerHTML = '<p class="message error">CEP inválido. Digite 8 números.</p>';
        return;
    }

    resultadoDiv.innerHTML = '<p class="message loading">Buscando...</p>';
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                resultadoDiv.innerHTML = '<p class="message error">CEP não encontrado.</p>';
            } else {
                resultadoDiv.innerHTML = `
                    <p><strong>CEP:</strong> ${data.cep}</p>
                    <p><strong>Logradouro:</strong> ${data.logradouro || 'Não informado'}</p>
                    <p><strong>Bairro:</strong> ${data.bairro || 'Não informado'}</p>
                    <p><strong>Cidade:</strong> ${data.localidade}</p>
                    <p><strong>Estado:</strong> ${data.uf}</p>
                `;
            }
        })
        .catch(() => {
            resultadoDiv.innerHTML = '<p class="message error">Erro ao buscar CEP. Tente novamente.</p>';
        });
}

// Função para buscar CNPJ (usando a API BrasilAPI)
function buscarCNPJ() {
    const cnpj = document.getElementById('searchInput').value.replace(/\D/g, '');
    const resultadoDiv = document.getElementById('resultado');

    if (cnpj.length !== 14) {
        resultadoDiv.innerHTML = '<p class="message error">CNPJ inválido. Digite 14 números.</p>';
        return;
    }

    resultadoDiv.innerHTML = '<p class="message loading">Buscando...</p>';
    const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('CNPJ não encontrado ou API indisponível.');
            }
            return response.json();
        })
        .then(data => {
            resultadoDiv.innerHTML = `
                <p><strong>Razão Social:</strong> ${data.razao_social}</p>
                <p><strong>Nome Fantasia:</strong> ${data.nome_fantasia || 'Não informado'}</p>
                <p><strong>CNPJ:</strong> ${data.cnpj}</p>
                <p><strong>Situação:</strong> ${data.descricao_situacao_cadastral}</p>
                <p><strong>Endereço:</strong> ${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio} - ${data.uf}</p>
                <p><strong>Atividade Principal:</strong> ${data.cnae_fiscal_descricao}</p>
            `;
        })
        .catch(error => {
            resultadoDiv.innerHTML = `<p class="message error">${error.message}</p>`;
        });
}