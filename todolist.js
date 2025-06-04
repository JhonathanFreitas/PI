let tasks = [];
let temaAtual = 'claro';

// Função para adicionar item
function addItem(event) {
  event.preventDefault();

// Pega os valores que o usuário inseriu nos campos de input
  const input = document.getElementById('novoItem');
  const data = document.getElementById('dataItem').value;
  const categoria = document.getElementById('categoriaItem').value;
  const prioridade = document.getElementById('prioridadeItem').value;
  const taskText = input.value.trim();

  if (taskText === '') {  // Se não tiver texto,  vai exibir uma mensagem de alerta na tela
    mostrarFeedback("⚠️ Por favor, insira uma tarefa.");
    return;
  }
  // Cria uma nova tarefa e adiciona na lista
  const task = {
    text: taskText,
    data,
    categoria,
    prioridade,
    completed: false
  };

  tasks.push(task);
  salvarNoLocalStorage();  // Salva a lista de tarefas no armazenamento local
  input.value = '';
  document.getElementById('dataItem').value = '';
  mostrarFeedback("✅ Tarefa adicionada!");
  atualizarTasks();
}

// Função de feedback
function mostrarFeedback(msg) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = msg;
  feedback.style.display = 'block';
  setTimeout(() => {
    feedback.style.opacity = '0';
    setTimeout(() => {
      feedback.textContent = '';
      feedback.style.display = 'none';
      feedback.style.opacity = '1';
    }, 500);
  }, 2000);
}

// Atualizar lista de tarefas
function atualizarTasks(filtro = 'Todas', termoBusca = '') {
  const lista = document.getElementById('listaItem');
  lista.innerHTML = '';

// Calcula a data de uma semana a partir de hoje
  const hoje = new Date();
  const fimDaSemana = new Date(hoje);
  fimDaSemana.setDate(hoje.getDate() + 7);

  const ordenacao = document.getElementById('ordenarSelect').value;

  let filtradas = tasks.filter(task => {
    const correspondeFiltro =
      filtro === 'Todas' ||
      (filtro === 'Hoje' && task.data === hoje.toISOString().split('T')[0]) ||
      (filtro === 'Semana' && task.data && task.data <= fimDaSemana.toISOString().split('T')[0]) ||
      task.categoria === filtro;

    const correspondeBusca = task.text.toLowerCase().includes(termoBusca.toLowerCase());
    return correspondeFiltro && correspondeBusca;
  });

  // Ordenação
  if (ordenacao === 'nome') {
    filtradas.sort((a, b) => a.text.localeCompare(b.text));
  } else if (ordenacao === 'data') {
    filtradas.sort((a, b) => (a.data || '').localeCompare(b.data || ''));
  } else if (ordenacao === 'prioridade') {
    const prioridadeOrdem = { Alta: 1, Média: 2, Baixa: 3 };
    filtradas.sort((a, b) => prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade]);
  }

  // Exibir tarefas
  filtradas.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'concluida' : ''} prioridade-${task.prioridade.toLowerCase()}`;

    li.innerHTML = `
      <label>
        <input type="checkbox" onchange="toggleConcluida(${tasks.indexOf(task)})" ${task.completed ? 'checked' : ''}>
        <span class="task-label">
          ${task.text} (${task.categoria} - ${formatarData(task.data)})
        </span>
      </label>
      <div class="botoes-acoes">
        <button class="btn-visualizar" onclick="visualizarItem(${tasks.indexOf(task)})" title="Visualizar">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-editar" onclick="editarItem(${tasks.indexOf(task)})" title="Editar">
          <i class="fas fa-pencil-alt"></i>
        </button>
        <button class="btn-remover" onclick="removerItem(${tasks.indexOf(task)})" title="Remover">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;

    lista.appendChild(li);
  });
}

// Função para visualizar os detalhes de uma tarefa
function visualizarItem(index) {
  const task = tasks[index];
  const modal = document.createElement('div'); 
  modal.className = 'modal-edicao';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-conteudo">
      <div class="modal-header">
        <h2>Detalhes da Tarefa</h2>
        <button class="btn-fechar" onclick="fecharModal()">&times;</button>
      </div>
      <div style="padding: 1.5rem;">
        <p><strong>Título:</strong> ${task.text}</p>
        <p><strong>Descrição:</strong> ${task.descricao || 'Sem descrição'}</p>
        <p><strong>Data:</strong> ${formatarData(task.data)}</p>
        <p><strong>Categoria:</strong> ${task.categoria}</p>
        <p><strong>Prioridade:</strong> ${task.prioridade}</p>
        <p><strong>Status:</strong> ${task.completed ? 'Concluída' : 'Pendente'}</p>
        <div class="modal-footer">
          <button class="btn btn-cancelar" onclick="fecharModal()">Fechar</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Adiciona suporte ao novo campo de descrição no formulário
// Supondo que haja um campo <textarea id="descricaoItem"></textarea> no HTML

document.getElementById('formTarefa').addEventListener('submit', function(e) {
  e.preventDefault();
  const text = document.getElementById('novoItem').value.trim();
  const data = document.getElementById('dataItem').value;
  const categoria = document.getElementById('categoriaItem').value;
  const prioridade = document.getElementById('prioridadeItem').value;
  const descricao = document.getElementById('descricaoItem')?.value.trim() || '';

  if (!text) return;

  tasks.push({ text, data, categoria, prioridade, descricao, completed: false });
  document.getElementById('novoItem').value = '';
  document.getElementById('dataItem').value = '';
  if (document.getElementById('descricaoItem')) document.getElementById('descricaoItem').value = '';
  atualizarTasks();
});


// Formatar data para exibição
function formatarData(dataString) {
  if (!dataString) return 'Sem data';
  const partes = dataString.split('-');
  if (partes.length !== 3) return dataString;
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

// Remover item
function removerItem(index) {
  if (confirm('Tem certeza que deseja remover esta tarefa?')) {
    tasks.splice(index, 1);
    salvarNoLocalStorage();
    atualizarTasks();
    mostrarFeedback("🗑️ Tarefa removida!");
  }
}

// Editar item (versão melhorada)
function editarItem(index) {
  const task = tasks[index];
  
  // Criar modal
  const modal = document.createElement('div');
  modal.className = 'modal-edicao';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-conteudo">
      <div class="modal-header">
        <h2>Editar Tarefa</h2>
        <button class="btn-fechar" onclick="fecharModal()">&times;</button>
      </div>
      <form id="formEdicao">
        <div class="form-group">
          <label for="editarTitulo">Titulo</label>
          <input type="text" id="editarTitulo" value="${task.text}" required>
        </div>

        <div class="form-group">
          <label for="editarTexto">Descrição</label>
          <textarea id="editarTexto">${task.descricao || ''}</textarea>
        </div>
        
        <div class="form-group">
          <label for="editarData">Data</label>
          <input type="date" id="editarData" value="${task.data || ''}">
        </div>
        
        <div class="form-group">
          <label for="editarCategoria">Categoria</label>
          <select id="editarCategoria">
            <option value="Trabalho" ${task.categoria === 'Trabalho' ? 'selected' : ''}>Trabalho</option>
            <option value="Pessoal" ${task.categoria === 'Pessoal' ? 'selected' : ''}>Pessoal</option>
            <option value="Estudos" ${task.categoria === 'Estudos' ? 'selected' : ''}>Estudos</option>
            <option value="Outros" ${task.categoria === 'Outros' ? 'selected' : ''}>Outros</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Prioridade</label>
          <div class="prioridade-opcoes">
            <label class="prioridade-option alta">
              <input type="radio" name="editarPrioridade" value="Alta" ${task.prioridade === 'Alta' ? 'checked' : ''}>
              <span>Alta</span>
            </label>
            <label class="prioridade-option media">
              <input type="radio" name="editarPrioridade" value="Média" ${task.prioridade === 'Média' ? 'checked' : ''}>
              <span>Média</span>
            </label>
            <label class="prioridade-option baixa">
              <input type="radio" name="editarPrioridade" value="Baixa" ${task.prioridade === 'Baixa' ? 'checked' : ''}>
              <span>Baixa</span>
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-cancelar" onclick="fecharModal()">Cancelar</button>
          <button type="submit" class="btn btn-salvar">Salvar Alterações</button>
        </div>
      </form>
    </div>
  `
  
  document.body.appendChild(modal);
  document.getElementById('editarTexto').focus();
  
  // Evento do formulário
  document.getElementById('formEdicao').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const novoTitulo = document.getElementById('editarTitulo').value.trim();
    const novaDescricao = document.getElementById('editarTexto').value.trim();
    const novaData = document.getElementById('editarData').value;
    const novaCategoria = document.getElementById('editarCategoria').value;
    const novaPrioridade = document.querySelector('input[name="editarPrioridade"]:checked').value;

    if (novoTitulo) {
      tasks[index].text = novoTitulo;
      tasks[index].descricao = novaDescricao;
      tasks[index].data = novaData;
      tasks[index].categoria = novaCategoria;
      tasks[index].prioridade = novaPrioridade;

      salvarNoLocalStorage();
      atualizarTasks();
      fecharModal();
      mostrarFeedback("✅ Tarefa atualizada!");
    }
  });
}

// Fechar modal
function fecharModal() {
  const modal = document.querySelector('.modal-edicao');
  if (modal) {
    modal.remove();
  }
}

// Alternar conclusão de tarefa
function toggleConcluida(index) {
  tasks[index].completed = !tasks[index].completed;
  salvarNoLocalStorage();
  atualizarTasks();
}

// Filtros
function filtrarCategoria(categoria) {
  atualizarTasks(categoria, document.getElementById('buscaTarefa').value);
}

// Local Storage
function salvarNoLocalStorage() {
  localStorage.setItem('avengersTasks', JSON.stringify(tasks));
}

function carregarDoLocalStorage() {
  const dados = localStorage.getItem('avengersTasks');
  if (dados) {
    tasks = JSON.parse(dados);
    atualizarTasks();
  }
}

// Alternar tema
function alternarTema() {
  const body = document.body;
  if (body.classList.contains('tema-claro')) {
    body.className = 'tema-escuro';
    temaBtn.textContent = '🌙 Tema Escuro';
    temaAtual = 'escuro';
  } else {
    body.className = 'tema-claro';
    temaBtn.textContent = '☀️ Tema Claro';
    temaAtual = 'claro';
  }
  const logo = document.getElementById('logoTopo');
  if (temaAtual === 'escuro') {
    logo.src = 'logo-branca.png';
  } else {
    logo.src = 'logo.png';
  }
  salvarTemaNoLocalStorage();
}

function salvarTemaNoLocalStorage() {
  localStorage.setItem('temaAvengers', temaAtual);
}

function carregarTemaDoLocalStorage() {
  const temaSalvo = localStorage.getItem('temaAvengers');
  if (temaSalvo) {
    temaAtual = temaSalvo;
    document.body.className = temaSalvo === 'escuro' ? 'tema-escuro' : 'tema-claro';
    temaBtn.textContent = temaSalvo === 'escuro' ? '🌙 Tema Escuro' : '☀️ Tema Claro';
  }
  const logo = document.getElementById('logoTopo');
  if (temaAtual === 'escuro') {
    logo.src = 'logo-branca.png';
  } else {
    logo.src = 'logo.png';
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  carregarDoLocalStorage();
  carregarTemaDoLocalStorage();
  
  document.getElementById('formTarefa').addEventListener('submit', addItem);
  document.getElementById('buscaTarefa').addEventListener('input', () => {
    atualizarTasks('Todas', document.getElementById('buscaTarefa').value);
  });
  
  document.getElementById('filtroHoje').addEventListener('click', () => atualizarTasks('Hoje'));
  document.getElementById('filtroSemana').addEventListener('click', () => atualizarTasks('Semana'));
  document.getElementById('filtroTodas').addEventListener('click', () => atualizarTasks('Todas'));
  
  document.getElementById('temaBtn').addEventListener('click', alternarTema);
});

function abrirSidebar() {
  document.querySelector('.sidebar').classList.add('aberta');
  document.querySelector('.overlay-sidebar').classList.add('ativa');
}

function fecharSidebar() {
  document.querySelector('.sidebar').classList.remove('aberta');
  document.querySelector('.overlay-sidebar').classList.remove('ativa');
}