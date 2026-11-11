(function () {
  'use strict';

  var WHATSAPP = '5547997084565';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Armazenamento seguro (evita erro se o navegador bloquear) */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* Ano do rodapé */
  $('#ano').textContent = new Date().getFullYear();

  /* Menu mobile */
  var menuBtn = $('#menuBtn');
  var nav = $('#nav');
  function fechaMenu() {
    nav.classList.remove('aberto');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = '☰';
  }
  menuBtn.addEventListener('click', function () {
    var aberto = nav.classList.toggle('aberto');
    menuBtn.setAttribute('aria-expanded', String(aberto));
    menuBtn.textContent = aberto ? '✕' : '☰';
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', fechaMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechaMenu(); });

  /* Botão voltar ao topo */
  var subir = $('#subir');
  window.addEventListener('scroll', function () {
    subir.classList.toggle('ver', window.scrollY > 500);
  }, { passive: true });
  subir.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Link ativo no menu conforme a seção visível */
  var links = $$('.nav a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    var secoes = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
    var ativo = new IntersectionObserver(function (itens) {
      itens.forEach(function (i) {
        if (i.isIntersecting) {
          links.forEach(function (a) {
            a.classList.toggle('ativo', a.getAttribute('href') === '#' + i.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secoes.forEach(function (s) { ativo.observe(s); });

    /* Revelação suave dos blocos principais */
    var alvos = $$('.card, .mini, .passos li, .dif, .dados, .contatos li, .form');
    alvos.forEach(function (el) { el.classList.add('reveal'); });
    var rev = new IntersectionObserver(function (itens, obs) {
      itens.forEach(function (i) {
        if (i.isIntersecting) { i.target.classList.add('on'); obs.unobserve(i.target); }
      });
    }, { threshold: 0.12 });
    alvos.forEach(function (el) { rev.observe(el); });
  }

  /* FAQ: abre um item por vez */
  var detalhes = $$('details');
  detalhes.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) detalhes.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* Máscara simples de telefone brasileiro */
  var fone = $('#fone');
  fone.addEventListener('input', function () {
    var v = fone.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = '(' + v.slice(0, 2) + ') ' + v.slice(2, v.length - 4) + '-' + v.slice(-4);
    else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
    fone.value = v;
  });

  /* Formulário: valida e envia para o WhatsApp */
  var form = $('#formContato');
  var erro = $('#erro');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = $('#nome').value.trim();
    var msg = $('#msg').value.trim();
    var assunto = $('#assunto').value;
    erro.textContent = '';
    if (nome.length < 2) { erro.textContent = 'Informe seu nome.'; $('#nome').focus(); return; }
    if (msg.length < 5) { erro.textContent = 'Escreva sua mensagem com mais detalhes.'; $('#msg').focus(); return; }
    if (!$('#aceite').checked) { erro.textContent = 'Aceite a Política de Privacidade para continuar.'; return; }
    var texto = 'Olá! Meu nome é ' + nome + '.\n' +
      'Assunto: ' + assunto + '\n' +
      (fone.value ? 'Telefone: ' + fone.value + '\n' : '') +
      'Mensagem: ' + msg;
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    form.reset();
  });

  /* Aviso de cookies (consentimento) */
  var aviso = $('#cookies');
  var escolha = store.get('cookies_consentimento');
  if (!escolha) aviso.hidden = false;
  function registra(valor) {
    store.set('cookies_consentimento', valor);
    aviso.hidden = true;
    /* Ponto de integração: carregue Google Analytics/Google Ads aqui
       somente quando valor === 'aceito'. */
    document.dispatchEvent(new CustomEvent('consentimento-cookies', { detail: valor }));
  }
  $('#aceitaCk').addEventListener('click', function () { registra('aceito'); });
  $('#recusaCk').addEventListener('click', function () { registra('recusado'); });
})();
