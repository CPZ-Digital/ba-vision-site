/* Central de Documentos — geradores de PDF (mesmos templates dos apps de orçamento).
   Depende de: html2pdf.bundle.min.js, docs-data.js (window.DOCS_TPL, window.DOCS_LOGO).
   Marca da página: window.DOCS_BRAND = 'cpz' | 'ba'. Funciona em file:// (templates e logos embutidos). */
(function () {
  const BRANDS = {
    cpz: { ba: false, razao: 'CPZ Digital', razaoLoc: 'CPZ Digital', empresaHtml: 'CPZ Digital', cnpj: '58.589.970/0001-54',
           tel: '(21) 96745-5648', email: 'contato@cpzdigital.com.br', cor: '#0055b3', corBg: '#f0f5ff', corR: '#f7f9ff', corL: '#e8eef8',
           resp: 'Adriano — CPZ Digital', respTxt: 'Adriano', rep: 'Adriano', sede: 'com sede no Rio de Janeiro/RJ',
           logoH: '40', rgb: [0, 85, 179] },
    ba:  { ba: true, razao: 'B&A Vision Segurança', razaoLoc: 'B&amp;A Vision Segurança Eletrônica', empresaHtml: 'B&amp;A Vision', cnpj: '62.456.202/0001-08',
           tel: '(21) 99664-6927', email: 'contato@bavision.com.br', cor: '#059669', corBg: '#f0fbf7', corR: '#f0fbf7', corL: '#d1f5e8',
           resp: 'Bruno &amp; Adriano — B&amp;A Vision', respTxt: 'Bruno e Adriano', rep: 'Bruno Leonardo de Souza Leite',
           sede: 'com sede na Rua Carlina 61, casa 1 fundos, Olaria, Rio de Janeiro/RJ, CEP 21.021-360',
           logoH: '48', rgb: [5, 150, 105] }
  };
  const brand = window.DOCS_BRAND || 'cpz';
  const B = BRANDS[brand];
  const HKEY = 'docs_hist_' + brand;
  const blank = '_______________________';

  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmtR = n => 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtData = iso => iso ? new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR') : '';
  const hoje = () => new Date().toISOString().slice(0, 10);
  const hora = () => { const d = new Date(); return [d.getHours(), d.getMinutes(), d.getSeconds()].map(x => String(x).padStart(2, '0')).join(''); };
  const slug = s => String(s).trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'cliente';
  const row = t => t ? `<p style="margin:2px 0 0;font-size:11px;color:#555;">${t}</p>` : '';
  const footerLine = `${B.ba ? 'B&A Vision' : 'CPZ Digital'}  |  ${B.tel}  |  ${B.email}  |  CNPJ: ${B.cnpj}`;

  function valorExtenso(v) {
    const U = ['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
    const D = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
    const C = ['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
    const ate999 = n => {
      if (n === 100) return 'cem';
      const c = Math.floor(n / 100), r = n % 100, p = [];
      if (c) p.push(C[c]);
      if (r) p.push(r < 20 ? U[r] : D[Math.floor(r / 10)] + (r % 10 ? ' e ' + U[r % 10] : ''));
      return p.join(' e ');
    };
    const inteiro = n => {
      if (n === 0) return 'zero';
      const mi = Math.floor(n / 1e6), mil = Math.floor(n % 1e6 / 1e3), r = n % 1e3, p = [];
      if (mi) p.push(ate999(mi) + (mi === 1 ? ' milhão' : ' milhões'));
      if (mil) p.push(mil === 1 ? 'mil' : ate999(mil) + ' mil');
      if (r) p.push(ate999(r));
      const ultimoComE = r && (r < 100 || r % 100 === 0);
      return p.reduce((a, b, k) => k === 0 ? b : a + (k === p.length - 1 && ultimoComE ? ' e ' : ', ') + b, '');
    };
    const cents = Math.round(v * 100), reais = Math.floor(cents / 100), cs = cents % 100;
    let t = inteiro(reais) + (reais === 1 ? ' real' : (reais >= 1e6 && reais % 1e6 === 0 ? ' de reais' : ' reais'));
    if (cs) t += ' e ' + inteiro(cs) + (cs === 1 ? ' centavo' : ' centavos');
    return t;
  }

  // "2x Câmera Bullet" / "2 Câmera" / "Cabo" por linha → [{qtd, descricao}]
  function parseItens(txt) {
    return String(txt || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const m = l.match(/^(\d+)\s*(?:[xX×]|un\.?|-|–)?\s+(.+)$/);
      return m ? { qtd: Number(m[1]), descricao: m[2] } : { qtd: 1, descricao: l };
    });
  }
  function tabelaItens(itens, titulo) {
    const THs = `background:${B.cor};color:#fff;padding:5px 8px;font-size:9px;font-weight:700;text-align:left;`;
    const TDL = 'padding:4px 8px;font-size:9px;color:#333;border-bottom:1px solid #eee;';
    const TDC = TDL + 'text-align:center;';
    if (!itens.length) return '';
    return (titulo ? `<p style="font-size:13px;font-weight:700;color:${B.cor};border-bottom:2px solid ${B.cor};padding-bottom:4px;margin:0 0 8px;page-break-after:avoid;">${titulo}</p>` : '') +
      `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
        <tr><th style="${THs}width:36px;text-align:center;">Item</th><th style="${THs}">Descrição</th><th style="${THs}text-align:center;width:44px;">Qtd</th></tr>` +
      itens.map((it, i) => `<tr style="background:${i % 2 ? B.corR : '#fff'}"><td style="${TDC}color:#888;">${i + 1}</td><td style="${TDL}">${esc(it.descricao)}</td><td style="${TDC}">${it.qtd}</td></tr>`).join('') +
      '</table>';
  }

  const base = () => ({
    '{{logo_src}}': window.DOCS_LOGO[brand], '{{logo_height}}': B.logoH,
    '{{cor_pri}}': B.cor, '{{cor_bg}}': B.corBg,
    '{{razao_social}}': B.razao.replace(/&/g, '&amp;'), '{{cnpj}}': B.cnpj,
    '{{contato_tel}}': B.tel, '{{contato_email}}': B.email, '{{cidade_uf}}': 'Rio de Janeiro/RJ'
  });

  /* ───────── DEFINIÇÃO DOS DOCUMENTOS ───────── */
  const PAG_DEFAULT = 'a) 30% (sinal) no ato da assinatura;\nb) 40% na metade da execução;\nc) 30% na conclusão e entrega dos serviços.';

  const DOCS = [
    { id: 'mo', icon: '🛠️', nome: 'Contrato de Mão de Obra', sub: 'Material por conta do contratante', margin: [12, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Contratante (empresa/cliente)', req: 1, ph: 'Razão social ou nome' },
        { k: 'doc', l: 'CNPJ/CPF', req: 1, half: 1 }, { k: 'tel', l: 'Telefone (opcional)', half: 1, ph: '(21) 90000-0000' },
        { k: 'endC', l: 'Endereço da contratante', ph: 'Sede/endereço da empresa' },
        { k: 'rep', l: 'Representante da contratante', ph: 'Nome de quem assina' },
        { k: 'endereco', l: 'Local da obra', req: 1 },
        { k: 'escopo', l: 'Escopo do serviço', t: 'textarea', req: 1, ph: 'Ex: instalação de 16 câmeras IP, passagem de cabos, configuração do NVR…' },
        { k: 'valor', l: 'Valor total (R$)', t: 'number', req: 1, half: 1 }, { k: 'inicio', l: 'Início', t: 'date', def: hoje, half: 1 },
        { k: 'fim', l: 'Previsão de conclusão', t: 'date', half: 1 }, { k: 'multa', l: 'Multa de rescisão (%)', t: 'number', def: '20', half: 1 },
        { k: 'parada', l: 'Diária de equipe parada R$ (opcional)', t: 'number', ph: 'Ex: 1000' },
        { k: 'prazo', l: 'Prazo de execução', def: 'aprox. 30 dias', half: 1 }, { k: 'garantia', l: 'Garantia do serviço', def: '90 dias', half: 1 },
        { k: 'pagamento', l: 'Forma de pagamento', t: 'textarea', def: PAG_DEFAULT },
        { k: 'obs', l: 'Condições especiais (opcional)', t: 'textarea' },
        { k: 't1', l: 'Testemunha 1 (opc.)', half: 1 }, { k: 't2', l: 'Testemunha 2 (opc.)', half: 1 }
      ],
      titulo: v => v.cliente, valor: v => fmtR(v.valor),
      validar: v => !(parseFloat(v.valor) > 0) ? 'Informe o valor total' : '',
      build(v, e) {
        const valor = parseFloat(v.valor);
        const multa = Math.min(100, Math.max(0, Number(v.multa) || 20));
        const parada = parseFloat(v.parada) || 0;
        return Object.assign(base(), {
          '{{numero}}': String(e.id).slice(-6), '{{dataFmt}}': fmtData(e.dataISO),
          '{{razao_social}}': B.razao.replace(/&/g, '&amp;'),
          '{{sede_contratada}}': B.sede, '{{rep_contratada}}': B.rep,
          '{{cliente}}': esc(v.cliente), '{{doc}}': esc(v.doc), '{{end_contratante}}': esc(v.endC || blank), '{{rep_contratante}}': esc(v.rep || blank),
          '{{local_obra}}': esc(v.endereco), '{{escopo}}': esc(v.escopo), '{{prazo}}': esc(v.prazo || 'a combinar'),
          '{{inicio}}': fmtData(v.inicio) || 'a definir', '{{fim}}': fmtData(v.fim) || 'a definir',
          '{{valor}}': fmtR(valor), '{{valor_extenso}}': valorExtenso(valor), '{{pagamento}}': esc(v.pagamento || 'A combinar.'),
          '{{garantia}}': esc(v.garantia || '90 dias'), '{{multa}}': String(multa),
          '{{diaria_parada}}': parada > 0 ? '(' + fmtR(parada) + ' por dia)' : '(conforme orçamento a ser apresentado)',
          '{{test1_nome}}': esc(v.t1 || blank), '{{test1_cpf}}': blank, '{{test2_nome}}': esc(v.t2 || blank), '{{test2_cpf}}': blank,
          '{{obs_block}}': v.obs ? `<h3>Cláusula 24ª — Das Condições Especiais</h3><p style="white-space:pre-wrap;">${esc(v.obs)}</p>` : ''
        });
      },
      arq: (v, e) => 'contrato-mao-de-obra-' + slug(v.cliente) + '-' + e.dataISO },

    { id: 'inst', icon: '📄', nome: 'Contrato de Instalação', sub: 'Fornecimento + instalação de CFTV', margin: [0, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Nome do cliente', req: 1 },
        { k: 'tel', l: 'Telefone', half: 1 }, { k: 'email', l: 'E-mail', half: 1 },
        { k: 'endereco', l: 'Local de instalação / endereço do contratante' },
        { k: 'data', l: 'Data', t: 'date', def: hoje, half: 1 }, { k: 'numero', l: 'Nº do contrato (opcional)', half: 1 },
        { k: 'itens', l: 'Materiais/equipamentos (um por linha: "8x Câmera Bullet")', t: 'textarea', ph: '8x Câmera Bullet 2MP\n1x DVR 8 canais\n100m Cabo UTP' },
        { k: 'total', l: 'Valor total (R$)', t: 'number', req: 1, half: 1 }, { k: 'desc', l: 'Desconto aplicado (%) (opc.)', t: 'number', half: 1 },
        { k: 'modo', l: 'Forma de pagamento', t: 'select', def: 'av5050', opts: [['av5050', 'À vista — 50% aprovação + 50% conclusão'], ['av1', 'À vista (1×)'], ['pix', 'Pix parcelado'], ['boleto', 'Boleto (+5%)'], ['cartao', 'Cartão (+10%)']] },
        { k: 'n', l: 'Nº de parcelas', t: 'number', def: '2', half: 1 }, { k: 'entrada', l: 'Entrada R$ (opcional)', t: 'number', half: 1 },
        { k: 'prazo', l: 'Prazo (dias úteis)', t: 'number', def: '2', half: 1 }, { k: 'garantia', l: 'Garantia', def: '6 meses', half: 1 },
        { k: 'validade', l: 'Dias até o 1º vencimento', t: 'number', def: '15' },
        { k: 'obs', l: 'Observações (opcional)', t: 'textarea' }
      ],
      titulo: v => v.cliente, valor: v => fmtR(v.total),
      validar: v => !(parseFloat(v.total) > 0) ? 'Informe o valor total' : '',
      build(v, e) {
        const total = parseFloat(v.total), validade = Number(v.validade) || 15, N = Math.max(1, Number(v.n) || 2), entrada = parseFloat(v.entrada) || 0;
        const base0 = new Date((v.data || hoje()) + 'T12:00:00').getTime();
        const addDias = d => new Date(base0 + d * 86400000).toLocaleDateString('pt-BR');
        const gerar = (t, n, suf) => {
          if (entrada > 0 && entrada < t && n > 1) {
            const r = [{ label: 'Entrada', recebe: entrada }];
            for (let i = 1; i <= n; i++) r.push({ label: i + 'ª parcela (' + suf + ')', recebe: (t - entrada) / n });
            return r;
          }
          return Array.from({ length: n }, (_, i) => ({ label: (i + 1) + 'ª parcela (' + suf + ')', recebe: t / n }));
        };
        const ativa = entrada > 0 && entrada < total;
        let parc, modoLabel, formaLabel;
        if (v.modo === 'av5050') { parc = [{ label: '50% — Aprovação', recebe: total / 2 }, { label: '50% — Conclusão', recebe: total / 2 }]; modoLabel = 'À Vista (Pix)'; formaLabel = '50% na aprovação + 50% na conclusão'; }
        else if (v.modo === 'av1') { parc = [{ label: 'À Vista (1×)', recebe: total }]; modoLabel = 'À Vista (Pix)'; formaLabel = 'À vista (1×)'; }
        else if (v.modo === 'pix') { parc = gerar(total, N, 'Pix'); modoLabel = 'Pix Parcelado'; formaLabel = ativa ? `Entrada + ${N}× Pix` : `${N}× Pix`; }
        else if (v.modo === 'boleto') { parc = gerar(Math.round(total * 1.05 / 50) * 50, N, 'Boleto'); modoLabel = 'Boleto Bancário'; formaLabel = ativa && N > 1 ? `Entrada + ${N}× mensais` : `${N}× mensais`; }
        else { parc = gerar(Math.round(total * 1.10 / 50) * 50, N, 'Cartão'); modoLabel = 'Cartão de Crédito'; formaLabel = ativa && N > 1 ? `Entrada + ${N}× no cartão` : `${N}× no cartão`; }
        const TDL = 'padding:8px 12px;font-size:12px;color:#333;border-bottom:1px solid #e8e8e8;';
        const rowsParc = parc.map((p, i) => `<tr style="background:${i % 2 ? B.corR : '#fff'}"><td style="${TDL}">${p.label}</td><td style="${TDL}text-align:center;">${addDias(validade + i * 30)}</td><td style="${TDL}text-align:right;font-weight:700;color:${B.cor};">${fmtR(p.recebe)}</td></tr>`).join('');
        const itens = parseItens(v.itens);
        const cams = itens.filter(i => /câmera|camera/i.test(i.descricao)).reduce((s, i) => s + i.qtd, 0);
        const desc = parseFloat(v.desc) || 0;
        return Object.assign(base(), {
          '{{dataFmt}}': addDias(0), '{{numero_contrato}}': esc(v.numero) || String(e.id).slice(-6),
          '{{responsavel}}': B.resp, '{{nome}}': esc(v.cliente), '{{tel}}': esc(v.tel),
          '{{email_row_ct}}': v.email ? `<p style="margin:2px 0 0;font-size:11px;color:#555;">E-mail: ${esc(v.email)}</p>` : '',
          '{{endereco_row_ct}}': v.endereco ? `<p style="margin:2px 0 0;font-size:11px;color:#555;">Local: ${esc(v.endereco)}</p>` : '',
          '{{total}}': fmtR(total) + (desc > 0 ? ` <span style="font-size:12px;font-weight:400;opacity:0.7;">(desconto ${desc}% aplicado)</span>` : ''),
          '{{modoLabel}}': modoLabel, '{{formaLabel}}': formaLabel, '{{rows_parc}}': rowsParc,
          '{{prazo}}': (v.prazo || '2') + ' dias úteis', '{{garantia}}': esc(v.garantia || '6 meses'),
          '{{garantia_texto}}': v.garantia ? `A CONTRATADA oferece garantia de <strong>${esc(v.garantia)}</strong> para equipamentos e serviços, a contar da data de conclusão. ` : '',
          '{{endereco_obra_bloco}}': v.endereco ? `<p style="font-size:12px;color:#444;margin:0 0 14px;"><strong>Local de instalação:</strong> ${esc(v.endereco)}</p>` : '',
          '{{relacao_materiais}}': tabelaItens(itens, 'Especificação de Materiais e Equipamentos'),
          '{{obs_block}}': v.obs ? `<p style="font-size:12px;font-weight:700;color:${B.cor};border-bottom:1.5px solid ${B.cor};padding-bottom:3px;margin:0 0 7px;">Observações</p><p style="font-size:11px;color:#444;line-height:1.8;margin:0 0 14px;white-space:pre-wrap;">${esc(v.obs)}</p>` : '',
          '{{tipo_contratante}}': 'pessoa física/jurídica', '{{endereco_contratante}}': esc(v.endereco) || '<span style="border-bottom:1px solid #aaa;display:inline-block;min-width:200px;">&nbsp;</span>',
          '{{representante_linha}}': ', neste ato representado por seu representante legal, ', '{{responsavel_texto}}': B.respTxt,
          '{{qtd_cameras_row}}': cams > 0 ? ` Serão instaladas <strong>${cams} câmeras</strong> conforme especificado no Anexo I.` : '',
          '{{validade}}': String(validade)
        });
      },
      arq: (v, e) => 'contrato-' + slug(v.cliente) + '-' + (e.v.data || e.dataISO) },

    { id: 'loc', icon: '📹', nome: 'Proposta de Locação', sub: 'Locação de CFTV com manutenção', margin: [12, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Cliente', req: 1 },
        { k: 'tel', l: 'Telefone', half: 1 }, { k: 'data', l: 'Data', t: 'date', def: hoje, half: 1 },
        { k: 'endereco', l: 'Local da obra' },
        { k: 'itens', l: 'Composição do sistema (um por linha: "8x Câmera Bullet")', t: 'textarea', ph: '8x Câmera Bullet 2MP\n1x NVR 8 canais\n1x HD 2TB' },
        { k: 'vInst', l: 'Valor da instalação (R$)', t: 'number', req: 1, half: 1 }, { k: 'vMensal', l: 'Valor mensal (R$)', t: 'number', req: 1, half: 1 },
        { k: 'meses', l: 'Prazo do contrato (meses)', t: 'number', def: '24', half: 1 }, { k: 'visitas', l: 'Visitas técnicas/mês', t: 'number', def: '4', half: 1 },
        { k: 'validade', l: 'Validade da proposta (dias)', t: 'number', def: '15', half: 1 }, { k: 'dias', l: 'Dias de armazenamento', t: 'number', def: '30', half: 1 }
      ],
      titulo: v => v.cliente, valor: v => fmtR(v.vMensal) + '/mês',
      validar: v => (isNaN(parseFloat(v.vInst)) || isNaN(parseFloat(v.vMensal))) ? 'Informe o valor de instalação e o mensal' : '',
      build(v) {
        const inst = parseFloat(v.vInst), men = parseFloat(v.vMensal), meses = Number(v.meses) || 24;
        const itens = parseItens(v.itens);
        return Object.assign(base(), {
          '{{empresa}}': B.empresaHtml, '{{razao_social}}': B.razaoLoc,
          '{{dataFmt}}': fmtData(v.data || hoje()), '{{validade}}': String(Number(v.validade) || 15),
          '{{nome}}': esc(v.cliente), '{{tel_row}}': row(v.tel && 'Tel: ' + esc(v.tel)), '{{endereco_row}}': row(v.endereco && 'Local: ' + esc(v.endereco)),
          '{{relacao_materiais}}': itens.length ? tabelaItens(itens) : '<p style="font-size:11px;color:#888;margin:0 0 10px;">Composição a definir.</p>',
          '{{dias_armazenamento}}': String(Number(v.dias) || 30), '{{valor_instalacao}}': fmtR(inst), '{{valor_mensal}}': fmtR(men),
          '{{visitas}}': String(Number(v.visitas) || 4), '{{prazo_meses}}': String(meses), '{{valor_total_periodo}}': fmtR(inst + men * meses)
        });
      },
      arq: (v, e) => 'proposta-locacao-' + slug(v.cliente) + '-' + (v.data || e.dataISO) },

    { id: 'nota', icon: '🧾', nome: 'Nota de Serviço', sub: 'Manutenção / serviço avulso', margin: [0, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Cliente', req: 1 },
        { k: 'tel', l: 'Telefone (opcional)', half: 1 }, { k: 'data', l: 'Data do serviço', t: 'date', def: hoje, half: 1 },
        { k: 'endereco', l: 'Endereço (opcional)' },
        { k: 'servico', l: 'Serviço executado', t: 'textarea', req: 1, ph: 'Descreva o serviço/manutenção realizado…' },
        { k: 'materiais', l: 'Peças/materiais utilizados (opcional)', t: 'textarea' },
        { k: 'valor', l: 'Valor cobrado (R$) (opcional)', t: 'number' }
      ],
      titulo: v => v.cliente, valor: v => parseFloat(v.valor) > 0 ? fmtR(v.valor) : '',
      validar: () => '',
      build(v, e) {
        const valor = parseFloat(v.valor) || 0;
        return Object.assign(base(), {
          '{{dataFmt}}': fmtData(v.data || hoje()), '{{numero_nota}}': String(e.id).slice(-6), '{{responsavel}}': B.resp,
          '{{cliente}}': esc(v.cliente), '{{tel_row}}': row(v.tel && 'Tel: ' + esc(v.tel)), '{{endereco_row}}': row(v.endereco && 'Local: ' + esc(v.endereco)),
          '{{servico}}': esc(v.servico),
          '{{materiais_block}}': v.materiais ? `<p style="font-size:13px;font-weight:700;color:${B.cor};border-bottom:2px solid ${B.cor};padding-bottom:4px;margin:16px 0 8px;">Peças e Materiais Utilizados</p><p style="font-size:12px;color:#444;line-height:1.8;margin:0 0 8px;white-space:pre-wrap;">${esc(v.materiais)}</p>` : '',
          '{{valor_block}}': valor > 0 ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:${B.cor};margin:16px 0 8px;"><tr><td style="padding:9px 16px;color:#fff;font-size:12px;font-weight:700;">VALOR COBRADO</td><td style="padding:9px 16px;color:#fff;font-size:18px;font-weight:700;text-align:right;">${fmtR(valor)}</td></tr></table>` : ''
        });
      },
      arq: (v, e) => 'nota-servico-' + slug(v.cliente) + '-' + (v.data || e.dataISO) }
  ];
  const byId = id => DOCS.find(d => d.id === id);

  /* ───────── GERAÇÃO DO PDF ───────── */
  function gerarPDF(doc, entry) {
    if (typeof html2pdf === 'undefined') { alert('html2pdf.bundle.min.js não carregou (precisa estar na mesma pasta da página).'); return Promise.resolve(); }
    const ph = doc.html ? {} : doc.build(entry.v, entry);
    let html = doc.html ? doc.html(entry.v, entry) : window.DOCS_TPL[doc.id];
    Object.entries(ph).forEach(([k, val]) => { html = html.split(k).join(val); });
    const nomeArq = doc.arq(entry.v, entry) + '-' + hora() + '.pdf';
    return html2pdf().from(html).set({
      margin: doc.margin, filename: nomeArq, image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, windowWidth: 720, scrollX: 0, scrollY: 0, onclone: d => { d.body.style.cssText = 'margin:0!important;padding:0!important;'; } },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).toPdf().get('pdf').then(pdf => {
      const n = pdf.internal.getNumberOfPages(), w = pdf.internal.pageSize.getWidth(), h = pdf.internal.pageSize.getHeight();
      for (let i = 1; i <= n; i++) {
        pdf.setPage(i); pdf.setDrawColor(...B.rgb); pdf.setLineWidth(0.4); pdf.line(4, h - 11, w - 4, h - 11);
        pdf.setFontSize(7); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(100, 100, 100);
        pdf.text(footerLine, w / 2, h - 7, { align: 'center' });
      }
      window.__lastPdf = pdf;
      pdf.save(nomeArq);
    });
  }

  /* ───────── HISTÓRICO LOCAL ───────── */
  const loadH = () => { try { return JSON.parse(localStorage.getItem(HKEY) || '[]'); } catch (e) { return []; } };
  const saveH = l => { try { localStorage.setItem(HKEY, JSON.stringify(l)); } catch (e) {} };

  /* ───────── UI ───────── */
  const $ = id => document.getElementById(id);
  function ensureStyle() {
    if ($('docs-style')) return;
    const st = document.createElement('style'); st.id = 'docs-style';
    st.textContent = `.g-h{font-size:15px;font-weight:700;color:#1a1a2e;margin:28px 0 12px;display:flex;align-items:center;gap:8px;padding-bottom:8px;border-bottom:2px solid ${B.corL}}
      .g-h small{font-size:11px;color:#999;font-weight:400}.docs-top{display:flex;gap:12px;align-items:center;margin-bottom:4px;flex-wrap:wrap}
      .docs-q{flex:1;min-width:200px;padding:11px 14px;border:1.5px solid #ccd6e8;border-radius:10px;font-size:14px;outline:none;background:#fff}.docs-q:focus{border-color:${B.cor}}
      .docs-hist-btn{padding:11px 18px;border-radius:10px;border:1.5px solid ${B.cor};background:#fff;color:${B.cor};font-weight:700;font-size:13px;cursor:pointer}.docs-hist-btn:hover{background:${B.corBg}}
      .docs-vazio{text-align:center;color:#888;font-size:13px;padding:30px 0}
      #docs-orc .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}#docs-orc .card{width:auto;padding:20px 16px}@media(max-width:520px){#docs-orc .cards{grid-template-columns:1fr 1fr;gap:10px}.docs-q{min-width:100%}}
      .field select,.field textarea{width:100%;padding:8px 10px;border:1px solid #ccd6e8;border-radius:6px;font-size:13px;color:#1a1a2e;outline:none;font-family:inherit;background:#fff}
      .field textarea{resize:vertical;min-height:64px;line-height:1.4}.field select:focus,.field textarea:focus{border-color:${B.cor}}
      .hist-item{display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #eee}.hist-item .hi-main{flex:1;min-width:0}
      .hist-item .hi-t{font-size:13px;font-weight:700;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hist-item .hi-s{font-size:11px;color:#888}
      .hist-tag{display:inline-block;font-size:10px;font-weight:700;padding:1px 7px;border-radius:10px;background:${B.corL};color:${B.cor};margin-right:6px}
      .btn-sm{padding:5px 10px;font-size:11px}.btn-red{background:#fde8e8;color:#c0392b}`;
    document.head.appendChild(st);
  }
  function ensureOverlay() {
    ensureStyle();
    if ($('docs-ov')) return;
    const ov = document.createElement('div');
    ov.className = 'overlay'; ov.id = 'docs-ov';
    ov.innerHTML = `<div class="modal" style="width:560px"><div class="modal-header"><h3 id="docs-t"></h3><button class="modal-close" id="docs-x">×</button></div>
      <div class="modal-body" id="docs-b"></div><div class="modal-footer" id="docs-f"></div></div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) fechar(); });
    $('docs-x').onclick = fechar;
  }
  const fechar = () => $('docs-ov').classList.remove('open');

  function fieldHtml(f, val) {
    const id = 'dc-' + f.k, v = val == null ? '' : esc(val).replace(/"/g, '&quot;');
    const lab = `<label>${esc(f.l)}${f.req ? ' *' : ''}</label>`;
    let inp;
    if (f.t === 'textarea') inp = `<textarea id="${id}" placeholder="${esc(f.ph || '')}">${esc(val == null ? '' : val)}</textarea>`;
    else if (f.t === 'select') inp = `<select id="${id}">${f.opts.map(o => `<option value="${o[0]}"${o[0] === val ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
    else inp = `<input id="${id}" type="${f.t === 'number' ? 'text' : (f.t || 'text')}"${f.t === 'number' ? ' inputmode="decimal" autocomplete="off"' : ''} value="${v}" placeholder="${esc(f.ph || '')}">`;
    return `<div class="field">${lab}${inp}</div>`;
  }

  function abrirForm(doc) {
    ensureOverlay();
    $('docs-t').textContent = doc.icon + ' ' + doc.nome + ' — ' + B.razao.replace('&amp;', '&');
    let html = '', open = 0;
    doc.campos.forEach(f => {
      const val = typeof f.def === 'function' ? f.def() : f.def;
      if (f.half) { if (!open) { html += '<div class="field-row">'; open = 1; } html += fieldHtml(f, val); if (open === 2) { html += '</div>'; open = 0; } else open = 2; }
      else { if (open) { html += '</div>'; open = 0; } html += fieldHtml(f, val); }
    });
    if (open) html += '</div>';
    $('docs-b').innerHTML = html;
    $('docs-f').innerHTML = `<span class="toast" id="docs-toast">Gerando PDF...</span><button class="btn btn-cancel" id="docs-c">Cancelar</button><button class="btn btn-pdf" id="docs-g">⬇ Gerar PDF</button>`;
    $('docs-c').onclick = fechar;
    $('docs-g').onclick = () => submeter(doc);
    $('docs-ov').classList.add('open');
  }

  // aceita formato brasileiro: "5.000" = 5000, "5.000,50" = 5000.50, "1,5" = 1.5
  function normNum(str) {
    let t = String(str).replace(/[R$\s]/g, '');
    if (!t) return '';
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    return t;
  }

  async function submeter(doc) {
    const v = {};
    doc.campos.forEach(f => { const raw = $('dc-' + f.k).value.trim(); v[f.k] = f.t === 'number' ? normNum(raw) : raw; });
    const ruim = doc.campos.find(f => f.t === 'number' && v[f.k] !== '' && !isFinite(Number(v[f.k])));
    if (ruim) { alert('Valor inválido em: ' + ruim.l); return; }
    const falta = doc.campos.find(f => f.req && !v[f.k]);
    if (falta) { alert('Preencha: ' + falta.l); return; }
    const erro = doc.validar(v);
    if (erro) { alert(erro); return; }
    const entry = { id: Date.now(), doc: doc.id, brand, dataISO: hoje(), v };
    entry.titulo = doc.titulo(v); entry.valor = doc.valor(v);
    const btn = $('docs-g'), toast = $('docs-toast');
    btn.disabled = true; toast.style.display = 'inline';
    try {
      await gerarPDF(doc, entry);
      const l = loadH(); l.unshift(entry); saveH(l);
      fechar(); renderHistCount();
    } catch (e) { alert('Erro ao gerar PDF: ' + e.message); }
    btn.disabled = false; toast.style.display = 'none';
  }

  function abrirHistorico(filtro) {
    ensureOverlay();
    $('docs-t').textContent = '📂 Documentos gerados — ' + B.razao.replace('&amp;', '&');
    const lista = loadH();
    $('docs-b').innerHTML = `<div class="field"><input id="dh-q" type="text" placeholder="Buscar por cliente ou tipo…" value="${esc(filtro || '')}"></div><div id="dh-l"></div>`;
    $('docs-f').innerHTML = `<button class="btn btn-cancel" id="docs-c">Fechar</button>`;
    $('docs-c').onclick = fechar;
    const draw = () => {
      const q = $('dh-q').value.toLowerCase();
      const itens = lista.filter(e => (e.titulo + ' ' + byId(e.doc).nome).toLowerCase().includes(q));
      $('dh-l').innerHTML = itens.length ? itens.map(e => `<div class="hist-item"><div class="hi-main"><div class="hi-t">${esc(e.titulo)}</div>
        <div class="hi-s"><span class="hist-tag">${esc(byId(e.doc).nome)}</span>${fmtData(e.dataISO)}${e.valor ? ' · ' + esc(e.valor) : ''}</div></div>
        <button class="btn btn-pdf btn-sm" data-r="${e.id}">Reimprimir</button><button class="btn btn-red btn-sm" data-d="${e.id}">Excluir</button></div>`).join('')
        : '<p style="text-align:center;color:#888;font-size:13px;padding:24px 0;">Nenhum documento gerado ainda.</p>';
    };
    $('dh-q').oninput = draw; draw();
    $('dh-l').onclick = async ev => {
      const r = ev.target.dataset.r, d = ev.target.dataset.d;
      if (r) { const e = lista.find(x => String(x.id) === r); ev.target.disabled = true; try { await gerarPDF(byId(e.doc), e); } catch (x) { alert('Erro: ' + x.message); } ev.target.disabled = false; }
      if (d && confirm('Excluir este documento do histórico?')) { const nl = lista.filter(x => String(x.id) !== d); saveH(nl); lista.length = 0; lista.push(...nl); draw(); renderHistCount(); }
    };
    $('docs-ov').classList.add('open');
  }

  function renderHistCount() {
    const el = $('docs-hist-sub'); if (el) el.textContent = loadH().length + ' gerado(s) neste aparelho';
  }

  const GRUPOS = [
    { t: '📱 Apps por assinatura', ids: ['L:barbearia', 'L:smart', 'licenca', 'lgpd'] },
    { t: '📹 Obras e CFTV', ids: ['inst', 'mo', 'loc', 'recmat', 'aditivo', 'notif', 'aceite', 'garantia', 'os', 'nota'] },
    { t: '🤝 Vendedores e indicação', ids: ['L:referral', 'parceria', 'comissao'] },
    { t: '💰 Financeiro e sócios', ids: ['recibo', 'lucro'] }
  ];
  function montar() {
    const box = $('docs-orc'); if (!box) return;
    ensureStyle();
    const q0 = ($('docs-q') || {}).value || '';
    const legacy = window.DOCS_LEGACY || [];
    const todos = {}; DOCS.forEach(d => todos[d.id] = d); legacy.forEach(l => todos[l.id] = l);
    const usados = new Set(); GRUPOS.forEach(g => g.ids.forEach(i => usados.add(i)));
    const grupos = GRUPOS.map(g => ({ t: g.t, ids: g.ids.filter(i => todos[i]) }));
    const sobra = Object.keys(todos).filter(i => !usados.has(i)); if (sobra.length) grupos.push({ t: '📄 Outros', ids: sobra });
    box.innerHTML = `<div class="docs-top"><input class="docs-q" id="docs-q" type="search" placeholder="Buscar documento… (ex: contrato, recibo, nota)" value="${esc(q0)}"><button class="docs-hist-btn" data-hist="1">📂 Documentos gerados <span id="docs-hist-sub" style="font-weight:400;font-size:11px"></span></button></div><div id="docs-grupos"></div>`;
    const draw = () => {
      const q = $('docs-q').value.trim().toLowerCase();
      const html = grupos.map(g => {
        const ids = g.ids.filter(i => !q || (todos[i].nome + ' ' + todos[i].sub + ' ' + g.t).toLowerCase().includes(q));
        if (!ids.length) return '';
        return `<div class="g-h">${g.t} <small>${ids.length}</small></div><div class="cards">` +
          ids.map(i => { const d = todos[i]; return `<div class="card" data-doc="${i}"><div class="card-icon">${d.icon}</div><div class="card-name">${d.nome}</div><div class="card-sub">${d.sub}</div></div>`; }).join('') + '</div>';
      }).join('');
      $('docs-grupos').innerHTML = html || '<div class="docs-vazio">Nenhum documento encontrado.</div>';
    };
    $('docs-q').oninput = draw; draw();
    box.onclick = e => {
      if (e.target.closest('[data-hist]')) return abrirHistorico();
      const c = e.target.closest('.card'); if (!c) return;
      const id = c.dataset.doc, l = legacy.find(x => x.id === id);
      if (l) window[l.fn](); else abrirForm(byId(id));
    };
    renderHistCount();
  }
  window.DOCS_API = { DOCS, gerarPDF, abrirForm, abrirHistorico, remontar: montar };
  window.DOCS_EXTENSO = valorExtenso;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
