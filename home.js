function alternarTema() {
    const body = document.body;
    const btn = document.getElementById('btnTema');
    const logo = document.getElementById('logoPrincipal');

    body.classList.toggle('tema-escuro');
    body.classList.toggle('tema-claro');

    const temaAtual = body.classList.contains('tema-escuro') ? 'escuro' : 'claro';
    btn.innerHTML = temaAtual === 'escuro' ? '🌙 Tema Escuro' : '☀️ Tema Claro';
    localStorage.setItem('temaAvengers', temaAtual);

    // troca a logo
    if (logo) logo.src = temaAtual === 'escuro' ? 'logo-branca.png' : 'logo.png';
  }

function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem('temaAvengers') || 'claro';
    document.body.classList.add(`tema-${temaSalvo}`);

    const btn = document.getElementById('btnTema');
    const logo = document.getElementById('logoPrincipal');

    btn.innerHTML = temaSalvo === 'escuro' ? '🌙 Tema Escuro' : '☀️ Tema Claro';
    
    // troca a logo no carregamento
    if (logo) logo.src = temaSalvo === 'escuro' ? 'logo-branca.png' : 'logo.png';
  }
  document.addEventListener('DOMContentLoaded', () => {
    carregarTemaSalvo();
    document.getElementById('btnTema').addEventListener('click', alternarTema);
  });