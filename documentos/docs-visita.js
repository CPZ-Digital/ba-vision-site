/* Relatório de Visita (manutenção) — as duas marcas. Carrega depois de docs-manut.js. */
(function () {
  const api = window.DOCS_API, U = window.DOCS_UI, M = window.DOCS_MANUT;
  if (!api || !U || !M) return;
  const { wrap, sec, p, lista, esc, fmtR, fmtData, hoje, slug, parseL, B } = U;
  const { SIS, NOME, ROTINA } = M;
  const STATUS = {
    ok: ['Sistema funcionando normalmente', '#16a34a', '#f0fdf4'],
    ressalvas: ['Funcionando com ressalvas (veja recomendações)', '#d97706', '#fffbeb'],
    parcial: ['Parcialmente fora de operação', '#ea580c', '#fff7ed'],
    fora: ['Sistema fora de operação', '#dc2626', '#fef2f2']
  };
  // um grupo de checklist por sistema, só aparece se o sistema estiver marcado
  const grupos = SIS.map(([k, nome]) => ({
    k: 'chk_' + k, l: nome + ' — itens verificados e OK (desmarque o que NÃO está OK ou não foi verificado)', t: 'check', dep: 'sistemas:' + k,
    opts: ROTINA[k].map((txt, i) => [String(i), txt]), def: ROTINA[k].map((_, i) => i).join('|')
  }));

  const doc = {
    id: 'visita', icon: '📋', nome: 'Relatório de Visita', sub: 'Checklist, fotos e status da manutenção', margin: [12, 0, 18, 0],
    campos: [
      { k: 'cliente', l: 'Cliente', req: 1 }, { k: 'doc', l: 'CNPJ/CPF (para o alerta de reputação)', ph: 'opcional' }, { k: 'endereco', l: 'Local atendido' },
      { k: 'data', l: 'Data', t: 'date', def: hoje, half: 1 }, { k: 'ref', l: 'Contrato (nº/ref.) (opcional)', half: 1 },
      { k: 'tipo', l: 'Tipo de visita', t: 'select', opts: [['Preventiva (obrigatória)', 'Preventiva (obrigatória)'], ['Corretiva (chamado)', 'Corretiva (chamado)'], ['Emergencial', 'Emergencial'], ['Visita adicional agendada', 'Visita adicional agendada']] },
      { k: 'visitaNum', l: 'Visita nº / incluídas no mês (ex: 1 de 2)', half: 1 }, { k: 'cobranca', l: 'Cobrança', t: 'select', opts: [['Incluída no contrato', 'Incluída no contrato'], ['Cobrada (visita adicional)', 'Cobrada (adicional)'], ['Cobrada (emergencial)', 'Cobrada (emergencial)']], half: 1 },
      { k: 'valorCobr', l: 'Valor cobrado R$ (se houver)', t: 'number', half: 1 }, { k: 'tecnico', l: 'Técnico', half: 1 },
      { k: 'chegada', l: 'Chegada', t: 'time', half: 1 }, { k: 'saida', l: 'Saída', t: 'time', half: 1 },
      { k: 'resp', l: 'Responsável no local (nome)' },
      { k: 'sistemas', l: 'Sistemas visitados', t: 'check', opts: SIS, def: 'cftv', req: 1 },
      ...grupos,
      { k: 'ocorr', l: 'Problemas / ocorrências encontradas', t: 'textarea', ph: 'Ex: câmera 7 sem imagem; HD com setores ruins; fotocélula do portão desalinhada' },
      { k: 'servicos', l: 'Serviços executados', t: 'textarea', req: 1, ph: 'O que foi feito nesta visita' },
      { k: 'pecas', l: 'Peças / materiais trocados (opcional)', t: 'textarea' },
      { k: 'status', l: 'Situação do sistema ao final', t: 'select', opts: [['ok', STATUS.ok[0]], ['ressalvas', STATUS.ressalvas[0]], ['parcial', STATUS.parcial[0]], ['fora', STATUS.fora[0]]] },
      { k: 'recom', l: 'Recomendações ao cliente (opcional)', t: 'textarea', ph: 'Ex: substituir o HD em até 30 dias; trocar bateria do nobreak' },
      { k: 'prox', l: 'Pendências / próximos passos (opcional)', t: 'textarea' },
      { k: 'fotos', l: 'Fotos (opcional)', t: 'foto' }
    ],
    titulo: v => v.cliente, valor: v => v.tipo || '',
    validar: v => !v.sistemas ? 'Marque ao menos um sistema visitado' : '',
    html(v, e) {
      const sis = String(v.sistemas || '').split('|').filter(Boolean);
      const st = STATUS[v.status] || STATUS.ok, cobr = parseFloat(v.valorCobr) || 0;
      const kv = (a, b) => `<td style="padding:6px 10px;font-size:11px;color:#555;border-bottom:1px solid #eee;"><b style="color:#333;">${a}</b><br>${b || '—'}</td>`;
      const resumo = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;page-break-inside:avoid;table-layout:fixed;">
        <tr>${kv('Data', fmtData(v.data))}${kv('Tipo', esc(v.tipo))}${kv('Visita nº', esc(v.visitaNum))}</tr>
        <tr>${kv('Chegada', esc(v.chegada))}${kv('Saída', esc(v.saida))}${kv('Técnico', esc(v.tecnico))}</tr>
        <tr>${kv('Cobrança', esc(v.cobranca) + (cobr > 0 ? ' — ' + fmtR(cobr) : ''))}${kv('Contrato', esc(v.ref))}${kv('Responsável no local', esc(v.resp))}</tr></table>`;
      const statusBox = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 10px;page-break-inside:avoid;"><tr><td style="padding:10px 14px;background:${st[2]};border-left:5px solid ${st[1]};font-size:13px;font-weight:700;color:${st[1]};">SITUAÇÃO AO FINAL DA VISITA: ${st[0].toUpperCase()}</td></tr></table>`;
      const check = sis.map(k => {
        const marcados = String(v['chk_' + k] || '').split('|');
        const itens = ROTINA[k].map((txt, i) => marcados.includes(String(i))
          ? `<p style="font-size:11.5px;color:#333;line-height:1.6;margin:0 0 2px;"><b style="color:#16a34a;">✔</b> ${esc(txt)}</p>`
          : `<p style="font-size:11.5px;color:#b91c1c;line-height:1.6;margin:0 0 2px;"><b>✖</b> ${esc(txt)} <i>(não OK / não verificado)</i></p>`).join('');
        return `<div style="page-break-inside:avoid;margin:0 0 8px;"><p style="font-size:12px;font-weight:700;color:#222;margin:8px 0 3px;">${NOME[k]}</p>${itens}</div>`;
      }).join('');
      const fotos = (v.fotos || []).length
        ? sec('Fotos da visita') + '<table width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;">' +
          (v.fotos || []).reduce((rows, f, i) => { if (i % 2 === 0) rows.push([]); rows[rows.length - 1].push(f); return rows; }, [])
            .map(r => '<tr>' + r.map(f => `<td style="width:50%;padding:4px;vertical-align:top;page-break-inside:avoid;"><img src="${f.s}" width="320" height="${Math.round(320 * f.h / f.w)}" style="display:block;width:320px;height:${Math.round(320 * f.h / f.w)}px;border:1px solid #ddd;"></td>`).join('') + (r.length === 1 ? '<td></td>' : '') + '</tr>').join('') + '</table>'
        : '';
      const corpo = sec('Resumo da visita') + resumo + statusBox +
        sec('Verificações realizadas') + p('<span style="font-size:11px;color:#666;"><b style="color:#16a34a;">✔</b> verificado e OK &nbsp;&nbsp; <b style="color:#b91c1c;">✖</b> não OK ou não verificado</span>') + check +
        (v.ocorr ? sec('Problemas e ocorrências encontradas', esc(v.ocorr)) : '') +
        sec('Serviços executados', esc(v.servicos)) +
        (v.pecas ? sec('Peças e materiais trocados', esc(v.pecas)) : '') +
        (v.recom ? sec('Recomendações', esc(v.recom)) : '') +
        (v.prox ? sec('Pendências e próximos passos', esc(v.prox)) : '') +
        fotos +
        p('<span style="font-size:11px;color:#666;">O responsável no local declara ter acompanhado esta visita e recebido as informações acima. Este relatório não substitui o contrato de manutenção.</span>');
      const vv = Object.assign({}, v, { doc: '', tel: '' });
      return wrap('RELATÓRIO DE VISITA TÉCNICA', e, vv, corpo, [[esc(v.tecnico) || B.razao, 'Técnico responsável'], [esc(v.resp) || esc(v.cliente), 'Responsável no local']], { rotA: 'Prestadora', rotB: 'Cliente' });
    },
    arq: (v, e) => 'relatorio-visita-' + slug(v.cliente) + '-' + (v.data || e.dataISO)
  };
  api.DOCS.push(doc);
  api.remontar();
})();
