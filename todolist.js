let tasks = [];
let temaAtual = 'claro';
let filtroAtual = 'Todas'; // Para manter o estado do filtro

// --- Funções do Modal de Adição ---
function abrirModalAdicionar() {
  document.getElementById('formAdicionar').reset();
  document.querySelector('input[name="addPrioridade"][value="Média"]').checked = true;
  document.getElementById('modalAdicionar').style.display = 'flex';
  document.getElementById('addTitulo').focus();
}

function fecharModalAdicionar() {
  document.getElementById('modalAdicionar').style.display = 'none';
}

function salvarNovaTarefa(event) {
  event.preventDefault();
  const titulo = document.getElementById('addTitulo').value.trim();
  if (titulo === '') {
    mostrarFeedback("⚠️ Por favor, insira o título da tarefa.");
    return;
  }
  const task = {
    text: titulo,
    descricao: document.getElementById('addDescricao').value.trim(),
    data: document.getElementById('addData').value,
    categoria: document.getElementById('addCategoria').value,
    prioridade: document.querySelector('input[name="addPrioridade"]:checked').value,
    completed: false
  };
  tasks.push(task);
  salvarNoLocalStorage();
  filtroAtual = 'Todas';
  atualizarTasks();
  fecharModalAdicionar();
  mostrarFeedback("✅ Tarefa adicionada com sucesso!");
}

// --- Funções de Renderização e Lógica ---

function mostrarFeedback(msg) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = msg;
  setTimeout(() => { feedback.textContent = ''; }, 3000);
}

function atualizarTasks() {
  const lista = document.getElementById('listaItem');
  lista.innerHTML = '';

  const termoBusca = document.getElementById('buscaTarefa').value;
  const hoje = new Date().toISOString().split('T')[0];
  const fimDaSemana = new Date();
  fimDaSemana.setDate(fimDaSemana.getDate() + 7);
  const dataFimSemana = fimDaSemana.toISOString().split('T')[0];
  const ordenacaoSelecionada = document.getElementById('ordenarSelect').value;

  let filtradas = tasks.filter(task => {
    const correspondeFiltro =
      filtroAtual === 'Todas' ||
      (filtroAtual === 'Hoje' && task.data === hoje) ||
      (filtroAtual === 'Semana' && task.data && task.data >= hoje && task.data <= dataFimSemana) ||
      task.categoria === filtroAtual;

    const correspondeBusca = termoBusca ? task.text.toLowerCase().includes(termoBusca.toLowerCase()) : true;
    return correspondeFiltro && correspondeBusca;
  });

  filtradas.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const prioridadeOrdem = { Alta: 1, Média: 2, Baixa: 3 };
    switch (ordenacaoSelecionada) {
      case 'prioridade':
        return (prioridadeOrdem[a.prioridade] || 4) - (prioridadeOrdem[b.prioridade] || 4);
      case 'data':
        return (a.data || '9999').localeCompare(b.data || '9999');
      case 'nome':
        return a.text.localeCompare(b.text);
      default:
        return (prioridadeOrdem[a.prioridade] || 4) - (prioridadeOrdem[b.prioridade] || 4);
    }
  });

  if (filtradas.length === 0) {
    let mensagem = `<li class="mensagem-vazio">Nenhuma tarefa encontrada.</li>`;
    if (filtroAtual === 'Hoje') {
      mensagem = `<li class="mensagem-vazio">🎉 Nenhuma tarefa para hoje!</li>`;
    } else if (filtroAtual === 'Semana') {
      mensagem = `<li class="mensagem-vazio">🗓️ Nenhuma tarefa agendada para esta semana.</li>`;
    }
    lista.innerHTML = mensagem;
    return;
  }

  filtradas.forEach((task) => {
    const li = document.createElement('li');
    const originalIndex = tasks.findIndex(t => t === task); 
    li.className = `task-item ${task.completed ? 'concluida' : ''} prioridade-${task.prioridade.toLowerCase()}`;
    li.dataset.index = originalIndex;

    li.innerHTML = `
      <div class="task-content">
        <input type="checkbox" id="task-${originalIndex}" onchange="toggleConcluida(${originalIndex})" ${task.completed ? 'checked' : ''}>
        <div class="task-info">
          <label for="task-${originalIndex}" class="task-title">${task.text}</label>
          <div class="task-meta">
            <span class="tag tag-category category-${task.categoria.toLowerCase()}">${task.categoria}</span>
            ${task.data ? `<span class="tag tag-date"><i class="far fa-calendar-alt"></i> ${formatarData(task.data, true)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="botoes-acoes">
        <button class="btn-visualizar" onclick="visualizarItem(${originalIndex})" title="Visualizar"><i class="fas fa-eye"></i></button>
        <button class="btn-editar" onclick="editarItem(${originalIndex})" title="Editar"><i class="fas fa-pencil-alt"></i></button>
        <button class="btn-remover" onclick="removerItem(${originalIndex})" title="Remover"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
    lista.appendChild(li);
  });
}

function visualizarItem(index) {
  const task = tasks[index];
  const modal = document.createElement('div');
  modal.className = 'modal-edicao'; 
  modal.innerHTML = `
    <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
    <div class="modal-conteudo">
      <div class="modal-header">
        <h2>Detalhes da Tarefa</h2>
        <button class="btn-fechar" onclick="this.closest('.modal-edicao').remove()">&times;</button>
      </div>
      <div class="modal-body" style="padding: 1rem; line-height: 1.8;">
        <p><strong>Título:</strong> ${task.text}</p>
        <p><strong>Descrição:</strong> ${task.descricao || '<em>Sem descrição</em>'}</p>
        <p><strong>Data:</strong> ${formatarData(task.data)}</p>
        <p><strong>Categoria:</strong> ${task.categoria}</p>
        <p><strong>Prioridade:</strong> ${task.prioridade}</p>
        <p><strong>Status:</strong> ${task.completed ? 'Concluída' : 'Pendente'}</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
}

function formatarData(dataString, curto = false) {
  if (!dataString) return 'Sem data';
  const partes = dataString.split('-');
  if (partes.length !== 3) return dataString;
  const [ano, mes, dia] = partes;
  return curto ? `${dia}/${mes}` : `${dia}/${mes}/${ano}`;
}

function removerItem(index) {
  if (confirm('Tem certeza que deseja remover esta tarefa?')) {
    tasks.splice(index, 1);
    salvarNoLocalStorage();
    atualizarTasks();
    mostrarFeedback("🗑️ Tarefa removida!");
  }
}

function editarItem(index) {
  const task = tasks[index];
  const modal = document.createElement('div');
  modal.className = 'modal-edicao';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
    <div class="modal-conteudo">
      <div class="modal-header"> <h2>Editar Tarefa</h2> <button class="btn-fechar" onclick="this.closest('.modal-edicao').remove()">&times;</button> </div>
      <div class="modal-body">
        <form id="formEdicao">
          <div class="form-group"><label for="editarTitulo">Título</label><input type="text" id="editarTitulo" class="form-control" value="${task.text}" required></div>
          <div class="form-group"><label for="editarTexto">Descrição</label><textarea id="editarTexto" class="form-control">${task.descricao || ''}</textarea></div>
          <div class="form-group"><label for="editarData">Data</label><input type="date" id="editarData" class="form-control" value="${task.data || ''}"></div>
          <div class="form-group"><label for="editarCategoria">Categoria</label><select id="editarCategoria" class="form-control">
            <option value="Estudos" ${task.categoria === 'Estudos' ? 'selected' : ''}>Estudos</option>
            <option value="Pessoal" ${task.categoria === 'Pessoal' ? 'selected' : ''}>Pessoal</option>
            <option value="Trabalho" ${task.categoria === 'Trabalho' ? 'selected' : ''}>Trabalho</option>
          </select></div>
          <div class="form-group"><label>Prioridade</label><div class="prioridade-opcoes">
            <label class="prioridade-option alta"><input type="radio" name="editarPrioridade" value="Alta" ${task.prioridade === 'Alta' ? 'checked' : ''}><span>Alta</span></label>
            <label class="prioridade-option media"><input type="radio" name="editarPrioridade" value="Média" ${task.prioridade === 'Média' ? 'checked' : ''}><span>Média</span></label>
            <label class="prioridade-option baixa"><input type="radio" name="editarPrioridade" value="Baixa" ${task.prioridade === 'Baixa' ? 'checked' : ''}><span>Baixa</span></label>
          </div></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-cancelar" onclick="this.closest('.modal-edicao').remove()">Cancelar</button>
            <button type="submit" class="btn btn-salvar">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
  document.getElementById('formEdicao').addEventListener('submit', (e) => {
    e.preventDefault();
    tasks[index].text = document.getElementById('editarTitulo').value.trim();
    tasks[index].descricao = document.getElementById('editarTexto').value.trim();
    tasks[index].data = document.getElementById('editarData').value;
    tasks[index].categoria = document.getElementById('editarCategoria').value;
    tasks[index].prioridade = document.querySelector('input[name="editarPrioridade"]:checked').value;
    salvarNoLocalStorage();
    atualizarTasks();
    modal.remove();
    mostrarFeedback("✅ Tarefa atualizada!");
  });
}

function toggleConcluida(index) {
  tasks[index].completed = !tasks[index].completed;
  salvarNoLocalStorage();
  atualizarTasks();
}

// --- Funções de Armazenamento e Tema ---
function salvarNoLocalStorage() { localStorage.setItem('avengersTasks', JSON.stringify(tasks)); }
function carregarDoLocalStorage() {
  const dados = localStorage.getItem('avengersTasks');
  if (dados) tasks = JSON.parse(dados);
  atualizarTasks();
}

function alternarTema() {
  const body = document.body;
  body.classList.toggle('tema-claro');
  body.classList.toggle('tema-escuro');
  temaAtual = body.classList.contains('tema-escuro') ? 'escuro' : 'claro';
  
  // Atualiza ambos os botões e os logos
  atualizarBotoesEIconesDeTema();
  
  localStorage.setItem('temaAvengers', temaAtual);
}

function carregarTemaDoLocalStorage() {
  const temaSalvo = localStorage.getItem('temaAvengers') || 'escuro';
  document.body.className = `tema-${temaSalvo}`;
  temaAtual = temaSalvo;
  
  atualizarBotoesEIconesDeTema();
}

function atualizarBotoesEIconesDeTema() {
  const ehEscuro = document.body.classList.contains('tema-escuro');
  
  const btnDesktop = document.getElementById('temaBtnDesktop');
  const btnMobile = document.getElementById('temaBtnMobile');
  const logoMobile = document.getElementById('logoTopoMobile');
  const logoSidebar = document.getElementById('logoSidebar');

  if(ehEscuro) {
    btnDesktop.innerHTML = '🌙 Tema Escuro';
    btnMobile.innerHTML = '🌙';
    if(logoMobile) logoMobile.src = 'logo-branca.png';
    if(logoSidebar) logoSidebar.src = 'logo-branca.png';
  } else {
    btnDesktop.innerHTML = '☀️ Tema Claro';
    btnMobile.innerHTML = '☀️';
    if(logoMobile) logoMobile.src = 'logo.png';
    if(logoSidebar) logoSidebar.src = 'logo.png';
  }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  carregarTemaDoLocalStorage();
  carregarDoLocalStorage();
  
  document.getElementById('abrirModalAdicionarBtn').addEventListener('click', abrirModalAdicionar);
  document.getElementById('formAdicionar').addEventListener('submit', salvarNovaTarefa);
  
  document.getElementById('buscaTarefa').addEventListener('input', atualizarTasks);
  document.getElementById('ordenarSelect').addEventListener('change', atualizarTasks);

  document.getElementById('filtroHoje').addEventListener('click', () => { filtroAtual = 'Hoje'; atualizarTasks(); });
  document.getElementById('filtroSemana').addEventListener('click', () => { filtroAtual = 'Semana'; atualizarTasks(); });
  document.getElementById('filtroTodas').addEventListener('click', () => { filtroAtual = 'Todas'; atualizarTasks(); });
});

// Funções para Sidebar em modo mobile
function filtrarCategoria(categoria) { filtroAtual = categoria; atualizarTasks(); }
function abrirSidebar() {
  document.querySelector('.sidebar').classList.add('aberta');
  document.querySelector('.overlay-sidebar').classList.add('ativa');
}
function fecharSidebar() {
  document.querySelector('.sidebar').classList.remove('aberta');
  document.querySelector('.overlay-sidebar').classList.remove('ativa');
}