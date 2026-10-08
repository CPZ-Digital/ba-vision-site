/* Contrato de Manutenção (CFTV, controle de acesso, interfone, portão eletrônico) — as duas marcas.
   Carrega depois de docs-extra.js (usa window.DOCS_UI). */
(function () {
  const api = window.DOCS_API, U = window.DOCS_UI;
  if (!api || !U) return;
  const { wrap, sec, p, lista, esc, fmtR, fmtData, hoje, slug, parseL, ext, B } = U;
  const cl = (n, t) => sec('Cláusula ' + n + 'ª — ' + t);
  const it = (n, t) => p('<b>' + n + '</b> ' + t);
  const blank = '_______________________';
  const mensal = v => parseFloat(v.valor) || 0;
  const ag = h => h.split(/(?=<p style="font-size:13px;font-weight:700;color:)/).map(x => x.startsWith('<p style="font-size:13px') ? '<div style="page-break-inside:avoid;">' + x + '</div>' : x).join('');

  const SIS = [['cftv', 'CFTV (câmeras)'], ['acesso', 'Controle de acesso'], ['interfone', 'Interfone'], ['portao', 'Portão eletrônico']];
  const NOME = { cftv: 'CFTV (circuito fechado de câmeras)', acesso: 'Controle de acesso', interfone: 'Interfone', portao: 'Portão eletrônico' };
  const ROTINA = {
    cftv: ['Limpeza das lentes e caixas das câmeras; conferência de posicionamento e foco', 'Teste de imagem de todas as câmeras (dia/noite, quando aplicável)', 'Verificação do gravador (DVR/NVR), do HD e do período de gravação disponível', 'Conferência de data/hora, usuários, senhas e acesso remoto', 'Inspeção de conectores, fontes, cabos e proteções visíveis'],
    acesso: ['Teste dos leitores (cartão, TAG, biometria, senha) e das fechaduras/eletroímãs', 'Verificação de controladoras, fontes, baterias/nobreak e botoeiras de saída', 'Conferência do software/cadastros, horários e regras de acesso', 'Teste de abertura e fechamento, mola/braço e travas', 'Inspeção de cabos, conexões e proteções visíveis'],
    interfone: ['Teste de áudio (e vídeo, se houver) entre a portaria/central e as unidades', 'Verificação da central, dos aparelhos e das campainhas/botoeiras', 'Teste do acionamento de abertura de portão/porta pelo interfone', 'Conferência de fontes, cabos e conexões visíveis'],
    portao: ['Inspeção e lubrificação do motor, cremalheira/correntes e roldanas (conforme o tipo)', 'Teste de fim de curso, fotocélulas e sensor antiesmagamento/anticolisão', 'Teste dos controles remotos/TAGs, da central e da botoeira', 'Verificação de travas, sinalização e do funcionamento da parada de emergência', 'Conferência de fixações, trilhos/guias e alinhamento']
  };

  window.DOCS_MANUT = { SIS, NOME, ROTINA };
  const doc = {
    id: 'manut', icon: '🛠️', nome: 'Contrato de Manutenção', sub: 'CFTV, acesso, interfone, portão', margin: [12, 0, 18, 0],
    campos: [
      { k: 'cliente', l: 'Contratante (empresa/condomínio/cliente)', req: 1 },
      { k: 'doc', l: 'CNPJ/CPF', req: 1, half: 1 }, { k: 'tel', l: 'Telefone', half: 1 },
      { k: 'endC', l: 'Endereço da contratante' }, { k: 'rep', l: 'Representante (quem assina)' },
      { k: 'endereco', l: 'Local atendido (se diferente)', ph: 'Endereço onde ficam os sistemas' },
      { k: 'sistemas', l: 'Sistemas atendidos', t: 'check', opts: SIS, def: 'cftv', req: 1 },
      { k: 'qtdCam', l: 'Nº de câmeras', t: 'number', half: 1 }, { k: 'qtdGrav', l: 'Nº de gravadores (DVR/NVR)', t: 'number', half: 1 },
            { k: 'qtdAcesso', l: 'Pontos de controle de acesso', t: 'number', half: 1 }, { k: 'qtdInterfone', l: 'Pontos de interfone', t: 'number', half: 1 },
      { k: 'qtdPortao', l: 'Nº de portões eletrônicos', t: 'number' },
      { k: 'inventario', l: 'Detalhamento dos equipamentos (opcional)', t: 'textarea', ph: 'Ex: Câmeras Intelbras bullet 2MP; NVR 16 canais; leitor facial na portaria…' },
      { k: 'visObrig', l: 'Visitas preventivas obrigatórias/mês (mín. 1)', t: 'number', def: '1', half: 1 }, { k: 'visGratis', l: 'Visitas gratuitas a chamado/mês', t: 'number', def: '1', half: 1 },
      { k: 'valVisita', l: 'Visita extra em horário comercial R$', t: 'number', def: '150', half: 1 }, { k: 'valEmerg', l: 'Visita extra fora do horário/fim de semana R$', t: 'number', def: '225', half: 1 },
      { k: 'horario', l: 'Horário comercial', def: 'segunda a sexta, das 9h às 18h, exceto feriados', half: 1 },
      { k: 'slaNormal', l: 'Prazo de atendimento (chamado comum)', def: 'até 48 horas úteis', half: 1 },
      { k: 'slaEmerg', l: 'Prazo de atendimento (emergência)', def: 'até 6 horas', half: 1 },
      { k: 'canal', l: 'Canal de chamados (WhatsApp/telefone)', half: 1 },
      { k: 'valor', l: 'Valor mensal total R$ (você define; veja a sugestão abaixo)', t: 'number', req: 1, half: 1 }, { k: 'dia', l: 'Dia de vencimento', t: 'number', def: '10', half: 1 },
      { k: 'inicio', l: 'Início do contrato', t: 'date', def: hoje, half: 1 }, { k: 'meses', l: 'Prazo do contrato (12 a 36 meses)', t: 'number', def: '36', half: 1 },
      { k: 'indice', l: 'Reajuste anual', t: 'select', opts: [['IPCA', 'IPCA'], ['IGP-M', 'IGP-M']], half: 1 }, { k: 'multa', l: 'Multa de rescisão no 1º ano, % das mensalidades restantes (2º ano 2/3, 3º ano 1/3)', t: 'number', def: '30', half: 1 },
      { k: 'pecas', l: 'Peças e equipamentos', t: 'select', opts: [['aparte', 'Cobrados à parte, mediante orçamento aprovado'], ['limite', 'Pequenas peças até um limite incluídas']] },
      { k: 'limitePecas', l: 'Limite de peças incluídas por mês R$ (se aplicável)', t: 'number' },
      { k: 'garantiaPecas', l: 'Garantia das peças trocadas', def: '90 dias', half: 1 }, { k: 'data', l: 'Data do contrato', t: 'date', def: hoje, half: 1 },
      { k: 'obs', l: 'Condições especiais (opcional)', t: 'textarea' },
      { k: 't1', l: 'Testemunha 1 (opc.)', half: 1 }, { k: 't2', l: 'Testemunha 2 (opc.)', half: 1 }
    ],
    calc: v => {
      const q = Number(v.qtdCam) || 0; if (!q) return '';
      const l = (a, x) => '<div style="display:flex;justify-content:space-between;padding:2px 0;"><span>' + a + '</span><b>' + fmtR(q * x) + '</b></div>';
      return '<div style="margin-top:10px;padding:10px 12px;background:#f0fbf7;border:1px solid #d5eee4;border-radius:8px;font-size:12px;color:#333;"><b>Sugestão de valor mensal (' + q + ' câmeras)</b>' + l('Instalação simples (R$ 20/câmera)', 20) + l('Dificuldade média (R$ 25/câmera)', 25) + l('Dificuldade alta (R$ 30/câmera)', 30) + '<div style="color:#777;margin-top:4px;">É só referência: digite no campo acima o valor que quiser.</div></div>';
    },
    titulo: v => v.cliente, valor: v => fmtR(mensal(v)) + '/mês',
    validar: v => !(mensal(v) > 0) ? 'Informe o valor mensal' : !(Number(v.meses) >= 12 && Number(v.meses) <= 36) ? 'O prazo deve ficar entre 12 e 36 meses' : !v.sistemas ? 'Marque ao menos um sistema atendido' : '',
    html(v, e) {
      const sis = String(v.sistemas || '').split('|').filter(Boolean), tem = k => sis.includes(k);
      const n = k => Number(v[k]) || 0;
      const valor = mensal(v), obrig = Math.max(1, n('visObrig')), gratis = Math.max(0, n('visGratis')), total = obrig + gratis;
      const valV = parseFloat(v.valVisita) || 0, valE = parseFloat(v.valEmerg) || 0, meses = n('meses') || 12, multa = Math.min(100, Math.max(0, n('multa') || 30)), m2 = Math.round(multa * 2 / 3), m3 = Math.round(multa / 3), cam13 = tem('cftv') && n('qtdCam') > 0;
      const dia = n('dia') || 10, local = v.endereco || v.endC || blank;
      const preco = x => x > 0 ? '<b>' + fmtR(x) + '</b>' : '<b>valor conforme tabela vigente da CONTRATADA</b>';
      const inv = [];
      if (tem('cftv')) { if (n('qtdCam')) inv.push(n('qtdCam') + ' câmera(s) de CFTV'); if (n('qtdGrav')) inv.push(n('qtdGrav') + ' gravador(es) (DVR/NVR)'); if (!n('qtdCam') && !n('qtdGrav')) inv.push('Sistema de CFTV (equipamentos conforme detalhamento)'); }
      if (tem('acesso')) inv.push((n('qtdAcesso') || 'Conforme detalhamento:') + (n('qtdAcesso') ? ' ponto(s) de controle de acesso' : ' controle de acesso'));
      if (tem('interfone')) inv.push((n('qtdInterfone') || 'Conforme detalhamento:') + (n('qtdInterfone') ? ' ponto(s) de interfone' : ' interfone'));
      if (tem('portao')) inv.push((n('qtdPortao') || 'Conforme detalhamento:') + (n('qtdPortao') ? ' portão(ões) eletrônico(s)' : ' portão eletrônico'));
      const nomes = sis.map(k => NOME[k]);
      const foraTxt = 'Todas as visitas (preventiva e corretiva) são feitas em <b>horário comercial</b>. O atendimento <b>fora do horário</b> existe só para emergência e consome a <b>visita corretiva (bônus)</b> do mês; se ela já tiver sido usada, é cobrado como visita extra, conforme a cláusula 4.2.';
      const pecasTxt = v.pecas === 'limite' && parseFloat(v.limitePecas) > 0
        ? `Peças de pequeno valor (conectores, cabos curtos, fusíveis e similares) estão incluídas até o limite de <b>${fmtR(parseFloat(v.limitePecas))} por mês</b>; acima disso, e para qualquer equipamento, aplica-se o orçamento prévio.`
        : 'Peças, componentes e equipamentos <b>não estão incluídos</b> na mensalidade e serão fornecidos mediante orçamento prévio aprovado pela CONTRATANTE.';

      const anexo1 = sec('Anexo I — Sistemas e equipamentos cobertos') + lista(inv, '▪') + (v.inventario ? p('<b>Detalhamento:</b> ' + esc(v.inventario)) : '');
      const anexo2 = sec('Anexo II — Rotina da visita preventiva') + sis.map(k => '<div style="page-break-inside:avoid;">' + p('<b>' + NOME[k] + '</b>') + lista(ROTINA[k], '☐') + '</div>').join('');

      const anexo3 = '<div style="page-break-inside:avoid;">' + sec('Anexo III — Ciência de risco (preencher quando houver recusa)') +
        p('Recomendação da CONTRATADA: ' + blank + blank) + p('Orçamento/serviço recusado: ' + blank + ' Data: ____/____/______') +
        p('A CONTRATANTE declara estar ciente de que a recomendação acima foi apresentada, que decidiu não executá-la e que assume o risco e as consequências, isentando a CONTRATADA de responsabilidade por falhas, danos ou perdas decorrentes.') +
        p('Assinatura da CONTRATANTE: ' + blank + blank) + '</div>';
      const corpo =
        p(`As partes celebram este <b>Contrato de Manutenção Preventiva e Corretiva</b>, regido pelas cláusulas a seguir${v.rep ? ', sendo a CONTRATANTE representada por <b>' + esc(v.rep) + '</b>' : ''}.`) +
        cl(1, 'Do Objeto') +
        it('1.1.', `A CONTRATADA prestará serviços de <b>manutenção preventiva e corretiva</b> nos seguintes sistemas: <b>${nomes.join('; ')}</b>, instalados em <b>${esc(local)}</b>, conforme o <b>Anexo I</b> (inventário coberto).`) +
        it('1.2.', 'Somente os sistemas e equipamentos listados no Anexo I são cobertos. Equipamentos incluídos depois dependem de aditivo ou inclusão no inventário, com possível reajuste da mensalidade.') +
        (cam13 ? it('1.3.', `A mensalidade foi fixada considerando <b>${n('qtdCam')} câmeras</b> e as condições do local. A inclusão ou retirada de câmeras ajusta o valor da mensalidade, a partir do mês seguinte, por aditivo ou confirmação por escrito.`) : '') +
        it(cam13 ? '1.4.' : '1.3.', 'Antes do início da vigência a CONTRATADA fará <b>vistoria inicial</b> e registrará no Anexo I o estado de cada item. Defeitos, falhas e obsolescência <b>já existentes</b> na vistoria não são cobertos pela mensalidade e serão orçados à parte; a CONTRATADA não responde pelos que a CONTRATANTE decidir não corrigir.') +
        cl(2, 'Da Manutenção Preventiva e Corretiva') +
        it('2.1.', '<b>Preventiva:</b> visita programada para inspeção, limpeza, testes e ajustes, seguindo a rotina do <b>Anexo II</b>. Ao fim de cada visita, a CONTRATADA registrará o que foi feito e as recomendações (relatório ou ordem de serviço assinada).') +
        it('2.2.', '<b>Corretiva:</b> atendimento a chamados para reparo de falhas de funcionamento dos sistemas cobertos, limitada à <b>mão de obra</b> técnica, aplicando-se a cláusula de peças.') +
        cl(3, 'Das Visitas Incluídas') +
        it('3.1.', `A mensalidade inclui <b>${total} visita(s) por mês</b>: <b>${obrig}</b> visita(s) <b>preventiva(s) obrigatória(s)</b>, agendada(s) de comum acordo, e <b>${gratis}</b> visita(s) <b>corretiva(s) sem custo adicional</b>, a chamado da CONTRATANTE.`) +
        it('3.2.', 'A visita preventiva é <b>obrigatória</b>: deve ser realizada todo mês. Se a CONTRATANTE não permitir o acesso, não estiver presente, ou remarcar com menos de <b>24 horas</b> de aviso ou para fora do mês, a visita será considerada <b>realizada</b> e descontada das visitas do mês, sem direito a reposição ou desconto.') +
        it('3.3.', 'As visitas incluídas <b>não são cumulativas</b>: as não utilizadas no mês expiram e não geram crédito, abatimento ou compensação.') +
        cl(4, 'Das Visitas Adicionais e Emergenciais') +
        it('4.1.', `Esgotadas as visitas incluídas, cada <b>visita extra</b> em horário comercial (${esc(v.horario)}) será cobrada em ${preco(valV)} por visita, mais peças, se houver.`) +
        it('4.2.', `A <b>visita fora do horário comercial</b> (noites, sábados, domingos e feriados) ou emergencial, solicitada para ocorrer em <b>${esc(v.slaEmerg)}</b>, depende da disponibilidade da equipe, consome a visita corretiva (bônus) do mês e, se esta já tiver sido usada, será cobrada em ${preco(valE)} por visita, mais peças, se houver.`) +
        it('4.3.', foraTxt) +
        it('4.4.', 'É considerado <b>chamado improcedente</b> aquele cuja causa não esteja nos sistemas cobertos (falta de energia ou de internet, mau uso, intervenção de terceiros, equipamento não listado). Ele consome uma visita incluída ou é cobrado como visita adicional, conforme o caso.') +
        it('4.5.', 'Locais fora do município do Rio de Janeiro, ou de difícil acesso, poderão ter taxa de deslocamento, a combinar previamente.') +
        it('4.6.', `<b>Visita extra perdida</b> (acesso negado, ausência de responsável ou remarcação com menos de 24 horas) será cobrada pelo valor da visita extra <b>acrescido de 20%</b>${valV > 0 ? ' (' + fmtR(valV * 1.2) + ' em horário comercial' + (valE > 0 ? '; ' + fmtR(valE * 1.2) + ' fora dele' : '') + ')' : ''}.`) +
        cl(5, 'Do Atendimento aos Chamados') +
        it('5.1.', `Os chamados serão abertos pelo canal <b>${esc(v.canal || 'informado pela CONTRATADA')}</b>, de ${esc(v.horario)}. O prazo de atendimento é <b>${esc(v.slaNormal)}</b> para chamados comuns e <b>${esc(v.slaEmerg)}</b> para emergências, contados da abertura completa do chamado, com a descrição do problema.`) +
        it('5.2.', 'Os prazos são metas de atendimento e podem variar por trânsito, clima, falta de acesso ou de peças, e não configuram garantia de funcionamento ininterrupto.') +
        cl(6, 'Das Peças, Equipamentos e Consumíveis') +
        it('6.1.', pecasTxt) +
        it('6.2.', 'Itens de desgaste e consumíveis (por exemplo HD, baterias e nobreaks, fontes, motores, correntes, fechaduras, botoeiras e controles remotos) têm vida útil limitada; sua substituição não é falha da manutenção e é cobrada à parte.') +
        it('6.3.', `As peças instaladas pela CONTRATADA têm garantia de <b>${esc(v.garantiaPecas || '90 dias')}</b> contra defeito de fabricação, desde que não haja mau uso, descarga elétrica ou intervenção de terceiros. O serviço de reparo tem garantia de mesma duração.`) +
        it('6.4.', 'Se a CONTRATANTE recusar orçamento ou reparo recomendado pela CONTRATADA, o risco passa a ser dela: a CONTRATADA registrará o aviso por escrito (<b>Anexo III</b>) e <b>não responde pelas consequências do defeito não corrigido</b>.') +
        cl(7, 'Das Exclusões') +
        it('7.1.', 'Não estão cobertos: danos por vandalismo, furto, roubo, incêndio, inundação, descargas elétricas e oscilações de energia; falhas da rede elétrica, de internet ou de equipamentos de terceiros; mau uso; alterações por terceiros; equipamentos obsoletos sem suporte do fabricante; obras civis; instalações novas e ampliações; programação de equipamentos não listados; e eventos de força maior. Se terceiros alterarem ou repararem o sistema, a CONTRATADA poderá refazer a vistoria (cobrada) e reenquadrar o inventário, sem responder pelas falhas decorrentes.') +
        cl(8, 'Das Obrigações da Contratada') +
        it('8.1.', 'Executar as visitas e os atendimentos com técnica e zelo, por profissional capacitado; registrar os serviços realizados; recomendar por escrito as correções e substituições necessárias; manter sigilo das informações e acessos; e adotar as medidas de segurança do trabalho aplicáveis.') +
        it('8.2.', 'A CONTRATADA <b>sempre executa o que a CONTRATANTE decidir</b> (quantidade, posicionamento, ângulo, configuração, período de gravação e demais escolhas), apresentando suas sugestões e riscos por escrito, e <b>nunca age por conta própria</b>. Se a CONTRATANTE mantiver a escolha contra a recomendação, a decisão e suas consequências são dela.') +
        cl(9, 'Das Obrigações da Contratante') +
        it('9.1.', 'Garantir acesso livre e seguro aos equipamentos nas visitas; designar responsável para acompanhar e assinar os registros; manter energia elétrica e internet em condições adequadas; abrir os chamados pelo canal indicado; comunicar de imediato falhas e ocorrências; não permitir que terceiros intervenham nos sistemas sem aviso; usar os sistemas de forma adequada; e efetuar os pagamentos em dia.') +
        it('9.2.', 'Quando houver sistema que dependa de internet (acesso remoto, nuvem), é responsabilidade da CONTRATANTE manter o serviço contratado e funcionando.') +
        cl(10, 'Do Valor e do Pagamento') +
        it('10.1.', `Pela manutenção, a CONTRATANTE pagará a mensalidade de <b>${fmtR(valor)}</b> (${ext(valor)}), com vencimento todo dia <b>${dia}</b>, por Pix ou meio informado pela CONTRATADA, com início em <b>${fmtData(v.inicio)}</b>.`) +
        it('10.2.', `O valor será reajustado a cada 12 meses pela variação do <b>${esc(v.indice || 'IPCA')}</b> acumulada no período, ou pelo menor índice que a lei permitir.`) +
        it('10.3.', 'O atraso sujeita a CONTRATANTE a multa de 2%, juros de 1% ao mês e correção monetária. Atraso superior a <b>10 dias</b> autoriza a suspensão das visitas e atendimentos (inclusive remotos) e da garantia até a regularização, sem prejuízo da cobrança; superior a <b>30 dias</b> autoriza a rescisão por culpa da CONTRATANTE.') +
        it('10.4.', 'Visitas adicionais, emergenciais e peças são cobradas à parte e vencem na entrega do serviço ou na data indicada no orçamento aprovado.') +
        cl(11, 'Do Prazo, Renovação e Rescisão') +
        it('11.1.', `O contrato vigora por <b>${meses} meses</b> a partir de ${fmtData(v.inicio)}, renovando-se automaticamente por períodos iguais, salvo aviso contrário por escrito com <b>60 dias</b> de antecedência.`) +
        it('11.2.', `A rescisão antecipada pela CONTRATANTE, sem justa causa, obriga ao pagamento de multa <b>decrescente</b> sobre o valor das mensalidades restantes do período vigente: <b>${multa}%</b> no 1º ano${meses > 12 ? ', <b>' + m2 + '%</b> no 2º ano' : ''}${meses > 24 ? ' e <b>' + m3 + '%</b> no 3º ano' : ''}, limitada a <b>6 mensalidades</b>, além dos valores já devidos.`) +
        it('11.3.', 'A rescisão por culpa da CONTRATANTE (inadimplência superior a 30 dias, impedimento reiterado de acesso ou descumprimento não sanado em 10 dias após notificação) sujeita-a à mesma multa. A rescisão por culpa comprovada da CONTRATADA, mantida após notificação e 10 dias para sanar, não gera multa.') +
        it('11.4.', 'A CONTRATADA poderá rescindir por falta de pagamento ou de condições de segurança para trabalhar, ou, sem justa causa, mediante aviso de 30 dias, sem multa.') +
        cl(12, 'Da Segurança e da Limitação de Responsabilidade') +
        it('12.1.', 'A manutenção reduz o risco de falhas, mas <b>não garante</b> o funcionamento ininterrupto dos sistemas nem a prevenção de crimes, furtos, acidentes ou sinistros. Sistemas de segurança complementam, e não substituem, outras medidas de proteção. A CONTRATADA não é seguradora nem presta serviço de vigilância. A obrigação é de meio. A CONTRATADA <b>não responde por bens furtados, roubados, danificados ou perdidos</b>, estejam ou não registrados nas imagens, nem pela escolha de posicionamento, ângulo, quantidade ou configuração das câmeras, que é sempre decisão da CONTRATANTE. <b>HD, cartão e nuvem não têm garantia de gravação ou de dados</b>; compete à CONTRATANTE conferir periodicamente se o sistema grava, avisar de falhas e manter backup do que for importante.') +
        (tem('portao') ? it('12.2.', '<b>Portão eletrônico:</b> a CONTRATANTE deve manter sinalização e os dispositivos de segurança (sensores, fotocélulas, parada de emergência) em funcionamento, não os desativar, e impedir o uso por crianças e animais sem supervisão. A CONTRATADA não responde por acidentes decorrentes de mau uso, da desativação dos dispositivos ou de intervenção de terceiros.') : '') +
        it(tem('portao') ? '12.3.' : '12.2.', 'A responsabilidade total da CONTRATADA, a qualquer título, fica limitada ao valor das mensalidades pagas nos <b>12 meses</b> anteriores ao fato, e não alcança lucros cessantes, danos indiretos, perda de imagens, dados ou receita.') +
        cl(13, 'Dos Dados Pessoais, Imagens e Biometria') +
        it('13.1.', 'As imagens, cadastros, credenciais e dados biométricos dos sistemas pertencem à CONTRATANTE, que é a <b>controladora</b> desses dados e responde por sua base legal, finalidade, placas de aviso e política de acesso. A CONTRATADA os acessará apenas para executar a manutenção, sem copiá-los ou compartilhá-los, conforme a Lei nº 13.709/2018 (LGPD).') +
        it('13.2.', 'Dados biométricos e imagens exigem atenção especial; a CONTRATANTE deve limitar o acesso a pessoas autorizadas. Retirada de imagens por solicitação da CONTRATANTE será serviço à parte.') +
        cl(14, 'Dos Acessos e Senhas') +
        it('14.1.', 'A CONTRATANTE informará os acessos necessários (senhas administrativas, acesso remoto) e responde por sua guarda. A CONTRATADA manterá sigilo e recomenda a troca de senhas padrão. Perda de acessos ou alterações por terceiros que impeçam o serviço podem gerar cobrança adicional para a recuperação.') +
        cl(15, 'Das Ampliações e Alterações') +
        it('15.1.', 'Instalação de novos pontos, trocas de equipamentos por modelos diferentes, mudanças de local e ampliações são serviços à parte, mediante orçamento e aprovação por escrito, e poderão alterar a mensalidade.') +
        cl(16, 'Do Não Aliciamento e da Natureza do Contrato') +
        it('16.1.', 'Durante a vigência e por 12 meses após o término, a CONTRATANTE não contratará, direta ou indiretamente, técnicos da CONTRATADA que tenham atuado neste contrato, sob pena de multa de 10% sobre o valor total do contrato.') +
        it('16.2.', 'Não há vínculo empregatício entre a CONTRATANTE e a equipe da CONTRATADA, que responde por seus encargos trabalhistas, previdenciários e fiscais.') +
        cl(17, 'Da Força Maior') +
        it('17.1.', 'Nenhuma parte responde por descumprimento decorrente de caso fortuito ou força maior, enquanto durar o evento, ficando os prazos suspensos; a parte afetada comunicará a outra assim que possível.') +
        cl(18, 'Disposições Gerais') +
        it('18.1.', 'Comunicações, aprovações e orçamentos podem ser feitos por escrito, e-mail ou aplicativo de mensagens, e o contrato pode ser assinado eletronicamente. A tolerância não importa renúncia e a nulidade de uma cláusula não afeta as demais.') +
        it('18.2.', 'Este contrato, assinado por duas testemunhas, constitui <b>título executivo extrajudicial</b> (art. 784, III, do Código de Processo Civil).') +
        it('18.3.', 'Fica eleito o foro da comarca do <b>Rio de Janeiro/RJ</b>, com renúncia a qualquer outro.') +
        (v.obs ? cl(19, 'Condições Especiais') + p(esc(v.obs)) : '') +
        anexo1 + anexo2 + anexo3 +
        p(`Rio de Janeiro/RJ, ${fmtData(v.data)}.`);
      const testem = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;page-break-inside:avoid;"><tr><td style="width:46%;height:28px;border-bottom:1px solid #555;"></td><td style="width:8%;"></td><td style="width:46%;height:28px;border-bottom:1px solid #555;"></td></tr>
        <tr><td style="text-align:center;padding-top:4px;font-size:9.5px;color:#555;">TESTEMUNHA 1 — ${esc(v.t1 || blank)}<br>CPF: ${blank}</td><td></td><td style="text-align:center;padding-top:4px;font-size:9.5px;color:#555;">TESTEMUNHA 2 — ${esc(v.t2 || blank)}<br>CPF: ${blank}</td></tr></table>`;
      const vv = Object.assign({}, v, { endereco: v.endC });
      return wrap('CONTRATO DE MANUTENÇÃO', e, vv, ag(corpo), [[B.razao, 'CONTRATADA'], [esc(v.cliente), 'CONTRATANTE']], { rotA: 'Contratada', rotB: 'Contratante' })
        .replace(/<\/td><\/tr><\/table>$/, testem + '</td></tr></table>');
    },
    arq: (v, e) => 'contrato-manutencao-' + slug(v.cliente) + '-' + (v.data || e.dataISO)
  };
  api.DOCS.push(doc);
  api.remontar();
})();
