/* Documentos de obra extras da Central (recibo, aceite, aditivo, notificação, recebimento de material, OS, garantia).
   Carrega DEPOIS de docs-core.js e ANTES do DOMContentLoaded montar os cards (usa DOCS_API.DOCS.push + DOCS_API.remontar). */
(function () {
  const api = window.DOCS_API; if (!api) return;
  const brand = window.DOCS_BRAND || 'cpz';
  const BR = {
    cpz: { razao: 'CPZ Digital', cnpj: '58.589.970/0001-54', tel: '(21) 96745-5648', email: 'contato@cpzdigital.com.br', cor: '#0055b3', corBg: '#f0f5ff', logoH: 40 },
    ba:  { razao: 'B&amp;A Vision Segurança', cnpj: '62.456.202/0001-08', tel: '(21) 99664-6927', email: 'contato@bavision.com.br', cor: '#059669', corBg: '#f0fbf7', logoH: 48 }
  };
  const B = BR[brand];
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmtR = n => 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtData = iso => iso ? new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR') : '';
  const hoje = () => new Date().toISOString().slice(0, 10);
  const slug = s => String(s).trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'cliente';
  const ext = v => window.DOCS_EXTENSO(v);
  const parseL = t => String(t || '').split('\n').map(l => l.trim()).filter(Boolean);

  const sec = (t, c) => `<p style="font-size:13px;font-weight:700;color:${B.cor};border-bottom:2px solid ${B.cor};padding-bottom:4px;margin:16px 0 8px;page-break-after:avoid;">${t}</p>` +
    (c ? `<div style="page-break-inside:avoid;"><p style="font-size:12px;color:#444;line-height:1.8;margin:0 0 8px;white-space:pre-wrap;text-align:justify;">${c}</p></div>` : '');
  const p = c => `<p style="font-size:12px;color:#444;line-height:1.8;margin:0 0 8px;white-space:pre-wrap;text-align:justify;">${c}</p>`;
  const lista = (linhas, marca) => '<div style="page-break-inside:avoid;margin:0 0 8px;">' + linhas.map(l => `<p style="font-size:12px;color:#444;line-height:1.7;margin:0 0 2px;">${marca || '•'} ${esc(l)}</p>`).join('') + '</div>';
  const box = (rot, val) => `<table width="100%" cellpadding="0" cellspacing="0" style="background:${B.cor};margin:10px 0;page-break-inside:avoid;"><tr><td style="padding:9px 16px;color:#fff;font-size:12px;font-weight:700;">${rot}</td><td style="padding:9px 16px;color:#fff;font-size:18px;font-weight:700;text-align:right;">${val}</td></tr></table>`;
  const linha = t => t ? `<p style="margin:2px 0 0;font-size:11px;color:#555;">${t}</p>` : '';

  function wrap(titulo, e, v, corpo, sigs, opt) {
    opt = opt || {};
    const partes = `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;page-break-inside:avoid;table-layout:fixed;"><tr>
      <td style="width:48%;padding:10px 12px;background:${B.corBg};border-left:4px solid ${B.cor};vertical-align:top;">
        <p style="margin:0 0 5px;font-size:10px;font-weight:700;color:${B.cor};text-transform:uppercase;letter-spacing:.6px;">${opt.rotA || 'Contratada'}</p>
        <p style="margin:0;font-size:12px;font-weight:700;">${B.razao}</p>${linha('CNPJ: ' + B.cnpj)}${linha('Tel: ' + B.tel)}${linha('E-mail: ' + B.email)}</td>
      <td style="width:4%;"></td>
      <td style="width:48%;padding:10px 12px;background:#f9f9f9;border-left:4px solid #aaa;vertical-align:top;">
        <p style="margin:0 0 5px;font-size:10px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:.6px;">${opt.rotB || 'Cliente / Contratante'}</p>
        <p style="margin:0;font-size:12px;font-weight:700;">${esc(v.cliente)}</p>${linha(v.doc && 'CNPJ/CPF: ' + esc(v.doc))}${linha(v.tel && 'Tel: ' + esc(v.tel))}${linha(v.endereco && 'Local: ' + esc(v.endereco))}</td></tr></table>`;
    const col = s => s ? `<td style="padding-top:5px;text-align:center;"><p style="margin:0;font-size:11px;font-weight:700;color:#222;text-align:center;">${s[0]}</p><p style="margin:1px 0 0;font-size:10px;color:#666;text-align:center;">${s[1]}</p></td>` : '<td></td>';
    const assin = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:34px 0 0;page-break-inside:avoid;"><tr>
      <td style="width:46%;height:34px;border-bottom:1.5px solid #555;"></td><td style="width:8%;"></td><td style="width:46%;height:34px;${sigs[1] ? 'border-bottom:1.5px solid #555;' : ''}"></td></tr>
      <tr>${col(sigs[0])}<td></td>${col(sigs[1])}</tr></table>`;
    return `<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;color:#1a1a2e;table-layout:fixed;max-width:100%;"><tr><td style="padding:0 28px;overflow:hidden;word-break:break-word;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:3px solid ${B.cor};padding-bottom:10px;margin-bottom:16px;page-break-inside:avoid;"><tr>
        <td style="vertical-align:middle;height:52px;"><img src="${window.DOCS_LOGO[brand]}" height="${B.logoH}" style="display:block;height:${B.logoH}px;width:auto;"></td>
        <td style="text-align:right;vertical-align:middle;"><p style="margin:0;font-size:16px;font-weight:700;color:${B.cor};">${titulo}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#555;">Nº ${String(e.id).slice(-6)} &nbsp;|&nbsp; ${fmtData(e.dataISO)}</p></td></tr></table>
      ${partes}${corpo}${assin}</td></tr></table>`;
  }
  const contratada = [B.razao, 'CONTRATADA'], contratante = v => [esc(v.cliente), 'CONTRATANTE'];
  const FORMAS = [['Pix', 'Pix'], ['Dinheiro', 'Dinheiro'], ['Transferência', 'Transferência'], ['Boleto', 'Boleto'], ['Cartão', 'Cartão']];

  const EXTRA = [
    { id: 'recibo', icon: '💵', nome: 'Recibo de Pagamento', sub: 'Sinal, parcela ou quitação', margin: [12, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Recebido de (nome)', req: 1 }, { k: 'doc', l: 'CNPJ/CPF (opcional)' },
        { k: 'valor', l: 'Valor recebido (R$)', t: 'number', req: 1, half: 1 }, { k: 'data', l: 'Data do pagamento', t: 'date', def: hoje, half: 1 },
        { k: 'forma', l: 'Forma', t: 'select', opts: FORMAS, half: 1 }, { k: 'saldo', l: 'Saldo restante R$ (opc.)', t: 'number', half: 1 },
        { k: 'referente', l: 'Referente a', t: 'textarea', req: 1, ph: 'Ex: sinal de 30% do contrato de instalação de CFTV — obra Rua X' }
      ],
      titulo: v => v.cliente, valor: v => fmtR(v.valor), validar: v => !(parseFloat(v.valor) > 0) ? 'Informe o valor' : '',
      html(v, e) {
        const val = parseFloat(v.valor), saldo = parseFloat(v.saldo) || 0;
        const corpo = sec('Recibo') +
          p(`Recebemos de <b>${esc(v.cliente)}</b>${v.doc ? ', CNPJ/CPF <b>' + esc(v.doc) + '</b>' : ''}, a importância de <b>${fmtR(val)}</b> (${ext(val)}), referente a <b>${esc(v.referente)}</b>, paga por <b>${esc(v.forma)}</b> em <b>${fmtData(v.data)}</b>.`) +
          box('VALOR RECEBIDO', fmtR(val)) +
          p('Damos plena e geral quitação do valor acima recebido' + (saldo > 0 ? `, ficando pendente o saldo de <b>${fmtR(saldo)}</b>, a ser pago conforme combinado` : '') + '.');
        return wrap('RECIBO DE PAGAMENTO', e, v, corpo, [[B.razao, 'RECEBEDOR'], null], { rotA: 'Quem recebeu', rotB: 'Quem pagou' });
      },
      arq: (v, e) => 'recibo-' + slug(v.cliente) + '-' + (v.data || e.dataISO) },

    { id: 'aceite', icon: '✅', nome: 'Termo de Entrega e Aceite', sub: 'Cliente assina que recebeu e testou', margin: [12, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Cliente', req: 1 }, { k: 'doc', l: 'CNPJ/CPF', half: 1 }, { k: 'tel', l: 'Telefone', half: 1 },
        { k: 'endereco', l: 'Local da obra', req: 1 }, { k: 'data', l: 'Data da entrega', t: 'date', def: hoje, half: 1 }, { k: 'ref', l: 'Contrato nº / data (opc.)', half: 1 },
        { k: 'servicos', l: 'Serviços entregues', t: 'textarea', req: 1, ph: 'Ex: instalação de 16 câmeras IP, NVR e acesso remoto' },
        { k: 'conferidos', l: 'Itens conferidos e testados (um por linha)', t: 'textarea', def: 'Câmeras instaladas e com imagem\nGravação funcionando\nAcesso remoto configurado\nOrientação de uso ao responsável' },
        { k: 'pendencias', l: 'Pendências (se houver)', t: 'textarea', ph: 'Deixe vazio se não houver' },
        { k: 'prazoPend', l: 'Prazo p/ corrigir pendências (dias)', t: 'number', def: '10', half: 1 }, { k: 'garantia', l: 'Garantia do serviço', def: '90 dias', half: 1 }
      ],
      titulo: v => v.cliente, valor: () => '', validar: () => '',
      html(v, e) {
        const pend = parseL(v.pendencias);
        const corpo = sec('Serviços entregues', esc(v.servicos)) + (v.ref ? p('Referente ao contrato: <b>' + esc(v.ref) + '</b>.') : '') +
          sec('Itens conferidos e testados') + lista(parseL(v.conferidos), '✔') +
          sec('Pendências') + (pend.length ? lista(pend) + p(`A CONTRATADA corrigirá as pendências acima em até <b>${Number(v.prazoPend) || 10} dias</b>, sem que isso impeça o aceite nem a quitação do contrato.`) : p('Nenhuma pendência apontada na data da entrega.')) +
          sec('Aceite', `O CONTRATANTE declara que <b>recebeu, conferiu e testou</b> os serviços acima em ${fmtData(v.data)}, aceitando-os. Defeitos de execução posteriores serão atendidos conforme a garantia de <b>${esc(v.garantia)}</b>, que cobre a mão de obra e exclui mau uso, intervenção de terceiros, descargas elétricas e falhas de rede elétrica, de internet ou de materiais fornecidos pelo contratante.`);
        return wrap('TERMO DE ENTREGA E ACEITE', e, v, corpo, [contratada, contratante(v)]);
      },
      arq: (v, e) => 'termo-aceite-' + slug(v.cliente) + '-' + (v.data || e.dataISO) },

    { id: 'aditivo', icon: '➕', nome: 'Aditivo / Serviço Extra', sub: 'Orçamento complementar ao contrato', margin: [12, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Cliente', req: 1 }, { k: 'doc', l: 'CNPJ/CPF', half: 1 }, { k: 'tel', l: 'Telefone', half: 1 },
        { k: 'endereco', l: 'Local da obra' }, { k: 'ref', l: 'Contrato original (nº / data)', req: 1, half: 1 }, { k: 'data', l: 'Data', t: 'date', def: hoje, half: 1 },
        { k: 'motivo', l: 'Motivo', t: 'select', opts: [['Solicitação da contratante', 'Solicitação da contratante'], ['Condição encontrada no local', 'Condição encontrada no local'], ['Alteração de projeto/escopo', 'Alteração de projeto/escopo'], ['Retrabalho por intervenção de terceiros', 'Retrabalho por intervenção de terceiros']] },
        { k: 'descricao', l: 'Serviço adicional', t: 'textarea', req: 1 },
        { k: 'valor', l: 'Valor adicional (R$)', t: 'number', req: 1, half: 1 }, { k: 'prazoAdd', l: 'Prazo adicional (dias)', t: 'number', def: '0', half: 1 },
        { k: 'pagamento', l: 'Forma de pagamento', t: 'textarea', def: 'À vista, na aprovação deste aditivo.' }
      ],
      titulo: v => v.cliente, valor: v => fmtR(v.valor), validar: v => !(parseFloat(v.valor) > 0) ? 'Informe o valor' : '',
      html(v, e) {
        const val = parseFloat(v.valor), add = Number(v.prazoAdd) || 0;
        const corpo = p(`Termo aditivo ao contrato de referência <b>${esc(v.ref)}</b>, firmado entre as partes acima.`) +
          sec('1. Do serviço adicional', esc(v.descricao)) + sec('2. Do motivo', esc(v.motivo) + '.') +
          sec('3. Do valor') + box('VALOR ADICIONAL', fmtR(val)) + p(`(${ext(val)}). <b>Pagamento:</b> ${esc(v.pagamento)}`) +
          sec('4. Do prazo', add > 0 ? `O prazo de execução fica acrescido de <b>${add} dia(s)</b>, contados da aprovação deste aditivo e da disponibilidade de acesso e materiais.` : 'Este aditivo não altera o prazo do contrato original, salvo atraso decorrente de causas previstas nele.') +
          sec('5. Da ratificação', 'O serviço adicional só será executado após a aprovação deste aditivo, por assinatura, e-mail ou mensagem de aplicativo. Permanecem inalteradas e ratificadas todas as demais cláusulas do contrato original.');
        return wrap('TERMO ADITIVO / SERVIÇO ADICIONAL', e, v, corpo, [contratada, contratante(v)]);
      },
      arq: (v, e) => 'aditivo-' + slug(v.cliente) + '-' + (v.data || e.dataISO) },

    { id: 'notif', icon: '⚠️', nome: 'Notificação de Paralisação', sub: 'Atraso/obra parada por culpa do cliente', margin: [12, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Cliente notificado', req: 1 }, { k: 'doc', l: 'CNPJ/CPF', half: 1 }, { k: 'tel', l: 'Telefone', half: 1 },
        { k: 'endereco', l: 'Local da obra' }, { k: 'ref', l: 'Contrato (nº / data)', req: 1, half: 1 }, { k: 'data', l: 'Paralisada desde', t: 'date', def: hoje, half: 1 },
        { k: 'motivo', l: 'Motivo da paralisação', t: 'textarea', req: 1, ph: 'Ex: material não entregue; acesso ao local negado; parcela vencida; obra não liberada' },
        { k: 'exigencia', l: 'O que a contratante deve fazer', t: 'textarea', def: 'Regularizar a situação acima e confirmar por escrito a liberação para continuidade dos serviços.' },
        { k: 'prazo', l: 'Prazo para regularizar (dias)', t: 'number', def: '3', half: 1 }, { k: 'parada', l: 'Diária de equipe parada R$ (opc.)', t: 'number', half: 1 }
      ],
      titulo: v => v.cliente, valor: () => '', validar: () => '',
      html(v, e) {
        const parada = parseFloat(v.parada) || 0;
        const corpo = sec('Notificação') + p(`À <b>${esc(v.cliente)}</b>${v.doc ? ' (' + esc(v.doc) + ')' : ''}.`) +
          p(`Pela presente, a CONTRATADA <b>notifica</b> que, desde <b>${fmtData(v.data)}</b>, a execução dos serviços do contrato de referência <b>${esc(v.ref)}</b> encontra-se <b>paralisada</b>, pelo seguinte motivo, não imputável à CONTRATADA:`) +
          sec('Motivo', esc(v.motivo)) + sec('Providências exigidas', esc(v.exigencia) + `\n\nPrazo para regularização: <b>${Number(v.prazo) || 3} dia(s)</b> a contar do recebimento desta notificação.`) +
          sec('Consequências', `Nos termos do contrato, o período de paralisação não é considerado atraso da CONTRATADA, o prazo de execução fica suspenso e passam a ser devidos os <b>custos adicionais</b> (diária de equipe parada${parada > 0 ? ', ' + fmtR(parada) + ' por dia' : ''}, mobilização, reagendamento e demais despesas). Persistindo a situação após o prazo acima, a CONTRATADA poderá <b>suspender definitivamente os serviços e rescindir o contrato por culpa da CONTRATANTE</b>, com a cobrança da multa e dos valores previstos na cláusula de rescisão.`) +
          p('A presente notificação também é válida se enviada por e-mail ou aplicativo de mensagens, conforme o contrato.');
        return wrap('NOTIFICAÇÃO DE PARALISAÇÃO', e, v, corpo, [contratada, ['Ciente — ' + esc(v.cliente), 'Data: ____/____/______']]);
      },
      arq: (v, e) => 'notificacao-' + slug(v.cliente) + '-' + (v.data || e.dataISO) },

    { id: 'recmat', icon: '📦', nome: 'Recebimento de Material', sub: 'O que o cliente entregou na obra', margin: [12, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Cliente / contratante', req: 1 }, { k: 'doc', l: 'CNPJ/CPF', half: 1 }, { k: 'data', l: 'Data do recebimento', t: 'date', def: hoje, half: 1 },
        { k: 'endereco', l: 'Local da obra' },
        { k: 'itens', l: 'Materiais recebidos (um por linha)', t: 'textarea', req: 1, ph: '16x Câmera IP\n1x NVR 16 canais\n2 caixas de cabo UTP' },
        { k: 'entregue', l: 'Entregue por (nome)', half: 1 }, { k: 'guarda', l: 'Guardado em', def: 'Sala trancada do local', half: 1 },
        { k: 'estado', l: 'Estado / observações', t: 'textarea', def: 'Conferência apenas por quantidade aparente, sem abertura de embalagens. Eventuais avarias aparentes: nenhuma.' }
      ],
      titulo: v => v.cliente, valor: () => '', validar: () => '',
      html(v, e) {
        const itens = parseL(v.itens);
        const corpo = sec('Declaração', `A CONTRATADA declara ter recebido da CONTRATANTE, em <b>${fmtData(v.data)}</b>${v.entregue ? ', por intermédio de <b>' + esc(v.entregue) + '</b>' : ''}, os materiais abaixo para a execução dos serviços contratados.`) +
          sec('Materiais recebidos') + lista(itens, '▪') + sec('Estado e observações', esc(v.estado)) +
          sec('Guarda e responsabilidade', `Os materiais ficarão guardados em: <b>${esc(v.guarda)}</b>. Conforme o contrato, a guarda e a segurança dos materiais no local são de responsabilidade da CONTRATANTE. A CONTRATADA conferiu apenas a quantidade aparente e não responde por defeito de fabricação, incompatibilidade ou falta de especificação dos materiais fornecidos.`);
        return wrap('TERMO DE RECEBIMENTO DE MATERIAL', e, v, corpo, [['Recebido por: ' + B.razao, 'CONTRATADA'], ['Entregue por: ' + esc(v.entregue || v.cliente), 'CONTRATANTE']]);
      },
      arq: (v, e) => 'recebimento-material-' + slug(v.cliente) + '-' + (v.data || e.dataISO) },

    { id: 'os', icon: '🔧', nome: 'Ordem de Serviço', sub: 'Manutenção / visita técnica', margin: [12, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Cliente', req: 1 }, { k: 'tel', l: 'Telefone', half: 1 }, { k: 'data', l: 'Data', t: 'date', def: hoje, half: 1 },
        { k: 'endereco', l: 'Endereço' },
        { k: 'tipo', l: 'Tipo', t: 'select', opts: [['Manutenção corretiva', 'Manutenção corretiva'], ['Manutenção preventiva', 'Manutenção preventiva'], ['Visita técnica', 'Visita técnica'], ['Instalação', 'Instalação']], half: 1 }, { k: 'tecnico', l: 'Técnico', half: 1 },
        { k: 'chegada', l: 'Chegada', t: 'time', half: 1 }, { k: 'saida', l: 'Saída', t: 'time', half: 1 },
        { k: 'problema', l: 'Problema relatado', t: 'textarea', req: 1 }, { k: 'servico', l: 'Serviço executado', t: 'textarea' },
        { k: 'materiais', l: 'Materiais utilizados (opcional)', t: 'textarea' }, { k: 'valor', l: 'Valor (R$) (opcional)', t: 'number' }
      ],
      titulo: v => v.cliente, valor: v => parseFloat(v.valor) > 0 ? fmtR(v.valor) : '', validar: () => '',
      html(v, e) {
        const val = parseFloat(v.valor) || 0;
        const corpo = `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;page-break-inside:avoid;"><tr>
          <td style="font-size:12px;color:#444;"><b>Tipo:</b> ${esc(v.tipo)}</td><td style="font-size:12px;color:#444;"><b>Técnico:</b> ${esc(v.tecnico) || '—'}</td>
          <td style="font-size:12px;color:#444;"><b>Chegada:</b> ${esc(v.chegada) || '—'}</td><td style="font-size:12px;color:#444;"><b>Saída:</b> ${esc(v.saida) || '—'}</td></tr></table>` +
          sec('Problema relatado', esc(v.problema)) + sec('Serviço executado', esc(v.servico) || '________________________________________________') +
          (v.materiais ? sec('Materiais utilizados', esc(v.materiais)) : '') + (val > 0 ? box('VALOR', fmtR(val)) : '');
        return wrap('ORDEM DE SERVIÇO', e, v, corpo, [[esc(v.tecnico) || B.razao, 'Técnico responsável'], [esc(v.cliente), 'Cliente — serviço conferido']]);
      },
      arq: (v, e) => 'os-' + slug(v.cliente) + '-' + (v.data || e.dataISO) },

    { id: 'garantia', icon: '🛡️', nome: 'Termo de Garantia', sub: 'Entregue no fim do serviço', margin: [12, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Cliente', req: 1 }, { k: 'doc', l: 'CNPJ/CPF', half: 1 }, { k: 'tel', l: 'Telefone', half: 1 },
        { k: 'endereco', l: 'Local' }, { k: 'concl', l: 'Data de conclusão', t: 'date', def: hoje, half: 1 }, { k: 'prazo', l: 'Prazo de garantia', def: '90 dias', half: 1 },
        { k: 'sistema', l: 'Serviço / sistema coberto', t: 'textarea', req: 1, ph: 'Ex: instalação de 16 câmeras IP e infraestrutura de cabeamento' }
      ],
      titulo: v => v.cliente, valor: () => '', validar: () => '',
      html(v, e) {
        const corpo = sec('Objeto', `Garantia dos serviços de <b>${esc(v.sistema)}</b>, concluídos em <b>${fmtData(v.concl)}</b>, pelo prazo de <b>${esc(v.prazo)}</b> a contar da conclusão.`) +
          sec('O que a garantia cobre', 'A correção, sem custo, de defeitos de execução da mão de obra e da instalação realizadas pela CONTRATADA, e dos equipamentos fornecidos por ela, conforme a garantia do fabricante.') +
          sec('O que não cobre') + lista(['Materiais e equipamentos fornecidos pelo cliente (defeito, incompatibilidade ou baixa qualidade)', 'Mau uso, quedas, vandalismo, furto e acidentes', 'Intervenção, manutenção ou alteração por terceiros', 'Descargas, surtos e oscilações elétricas; falhas da rede elétrica, de dados ou de internet', 'Umidade, infiltração e problemas estruturais do local', 'Ampliações e alterações posteriores à entrega']) +
          sec('Como acionar', `Entre em contato pelo telefone <b>${B.tel}</b> ou e-mail <b>${B.email}</b>, descrevendo o problema. O atendimento ocorrerá em prazo razoável, em horário comercial.`) +
          sec('Validade', 'A garantia vale mediante o pagamento integral do serviço e fica suspensa enquanto houver parcela vencida e não paga.');
        return wrap('TERMO DE GARANTIA', e, v, corpo, [contratada, contratante(v)]);
      },
      arq: (v, e) => 'garantia-' + slug(v.cliente) + '-' + (v.concl || e.dataISO) },

    { id: 'lucro', icon: '📊', nome: 'Divisão de Lucro da Obra', sub: 'Resumo interno entre sócios', margin: [12, 0, 18, 0],
      campos: [
        { k: 'cliente', l: 'Obra / cliente', req: 1 }, { k: 'data', l: 'Data', t: 'date', def: hoje, half: 1 }, { k: 'recebido', l: 'Valor total recebido (R$)', t: 'number', req: 1, half: 1 },
        { k: 'material', l: 'Material (repasse) R$', t: 'number', def: '0', half: 1 }, { k: 'infra', l: 'Infraestrutura (repasse) R$', t: 'number', def: '0', half: 1 },
        { k: 'dias', l: 'Dias de trabalho dos sócios', t: 'number', req: 1, half: 1 }, { k: 'diaria', l: 'Diária de cada sócio R$', t: 'number', def: brand === 'ba' ? '350' : '300', half: 1 },
        { k: 'diasDiar', l: 'Diaristas: total de diárias', t: 'number', def: '0', half: 1 }, { k: 'valDiar', l: 'Valor da diária do diarista R$', t: 'number', def: '150', half: 1 },
        { k: 'desl', l: 'Deslocamento R$ (vazio = R$50 × dias)', t: 'number', half: 1 }, { k: 'outros', l: 'Outros custos R$', t: 'number', def: '0', half: 1 },
        { k: 'obs', l: 'Observações', t: 'textarea' }
      ],
      titulo: v => v.cliente, valor: v => fmtR(v.recebido), validar: v => !(parseFloat(v.recebido) > 0) ? 'Informe o valor recebido' : '',
      html(v, e) {
        const n = k => parseFloat(v[k]) || 0, ba = brand === 'ba';
        const rec = n('recebido'), mat = n('material'), inf = n('infra'), dias = n('dias'), socios = ba ? 2 : 1;
        const diarias = dias * n('diaria') * socios, diaristas = n('diasDiar') * n('valDiar');
        const desl = v.desl === '' ? 50 * dias : n('desl'), out = n('outros');
        const custos = mat + inf + diarias + diaristas + desl + out, pool = rec - custos;
        const linhaT = (a, b, forte) => `<tr><td style="padding:6px 10px;font-size:12px;color:#333;border-bottom:1px solid #e8e8e8;${forte ? 'font-weight:700;' : ''}">${a}</td><td style="padding:6px 10px;font-size:12px;color:#333;border-bottom:1px solid #e8e8e8;text-align:right;${forte ? 'font-weight:700;' : ''}">${b}</td></tr>`;
        const tab = rows => `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;page-break-inside:avoid;">${rows}</table>`;
        const parteDe = pct => (pool > 0 ? pool * pct : 0);
        const dSocio = dias * n('diaria');
        const divisao = ba
          ? [['Adriano', dSocio, 0.4], ['Bruno', dSocio, 0.4], ['Caixa da empresa', 0, 0.2]]
          : [['Adriano', dSocio, 0.7], ['Caixa da empresa', 0, 0.3]];
        const corpo = sec('Resultado da obra') + tab(
            linhaT('Valor recebido', fmtR(rec), 1) + linhaT('(−) Material (repasse)', fmtR(mat)) + linhaT('(−) Infraestrutura (repasse)', fmtR(inf)) +
            linhaT('(−) Diárias dos sócios (' + dias + ' dia(s) × ' + socios + ' × ' + fmtR(n('diaria')) + ')', fmtR(diarias)) +
            linhaT('(−) Diaristas (' + n('diasDiar') + ' diária(s))', fmtR(diaristas)) + linhaT('(−) Deslocamento', fmtR(desl)) + linhaT('(−) Outros custos', fmtR(out)) +
            linhaT('Lucro a dividir', fmtR(pool), 1)) +
          (pool > 0
            ? sec('Divisão') + tab(divisao.map(([nome, di, pc]) => linhaT(nome + ' — diária ' + fmtR(di) + ' + ' + Math.round(pc * 100) + '% do lucro (' + fmtR(parteDe(pc)) + ')', fmtR(di + parteDe(pc)), 1)).join('')) +
              p('A diária é remuneração garantida pelo trabalho e não entra na divisão; apenas o lucro (resultado depois de todos os custos) é dividido nas proporções acima.')
            : p('<b>Atenção:</b> a obra não gerou lucro a dividir (' + fmtR(pool) + '). As diárias dos sócios continuam sendo remuneração devida, e o resultado negativo deve ser coberto pelo caixa ou renegociado.')) +
          (v.obs ? sec('Observações', esc(v.obs)) : '');
        return wrap('DIVISÃO DE LUCRO DA OBRA', e, Object.assign({}, v, { doc: '', tel: '', endereco: '' }), corpo, ba ? [['Adriano', 'Sócio'], ['Bruno', 'Sócio']] : [['Adriano', 'Responsável'], null], { rotA: 'Empresa', rotB: 'Obra' });
      },
      arq: (v, e) => 'divisao-lucro-' + slug(v.cliente) + '-' + (v.data || e.dataISO) }
  ];

  window.DOCS_UI = { wrap, sec, p, lista, box, linha, esc, fmtR, fmtData, hoje, slug, parseL, ext, B, brand };
  EXTRA.forEach(d => api.DOCS.push(d));
  api.remontar();
})();
