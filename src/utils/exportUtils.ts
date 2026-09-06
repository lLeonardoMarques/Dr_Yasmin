import { AnamnesisRecord, Patient } from '../types';
import { MONGO_ATLAS_GUIDE, API_ENDPOINTS_DOCS } from '../data/backendDoc';

/**
 * Exporta a ficha de anamnese completa em formato Word (.doc compatível com MS Word e LibreOffice/Google Docs)
 */
export function exportAnamnesisToWord(record: AnamnesisRecord, patient?: Patient) {
  const patientName = patient?.name || record.patientName;
  const patientEmail = patient?.email || record.patientEmail;
  const patientPhone = patient?.phone || record.patientPhone;
  const formattedDate = new Date(record.createdAt).toLocaleDateString('pt-BR');

  const bodyAreasHtml = record.bodyAreas && record.bodyAreas.length > 0
    ? record.bodyAreas.map(b => `<li style="margin-bottom: 4px;"><b>${b.name}</b> (${b.type.replace('_', ' ')}) - Intensidade: ${b.intensity || 5}/10</li>`).join('')
    : '<li>Nenhuma área pontual marcada como crítica.</li>';

  const alertsHtml = record.detectedAlerts && record.detectedAlerts.length > 0
    ? `<div style="background-color: #fef2f2; border: 1px solid #f87171; padding: 10px; margin: 12px 0; border-radius: 4px;">
        <b style="color: #991b1b;">⚠️ ALERTAS E CONTRAINDICAÇÕES CLÍNICAS IDENTIFICADAS:</b>
        <ul style="margin: 6px 0 0 16px; color: #7f1d1d;">
          ${record.detectedAlerts.map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>`
    : '<p style="color: #166534;"><b>Nenhuma contraindicação clínica impeditiva identificada.</b></p>';

  const techniquesHtml = record.recommendedTechniques && record.recommendedTechniques.length > 0
    ? record.recommendedTechniques.map(t => `<li style="margin-bottom: 4px;">${t}</li>`).join('')
    : '<li>Protocolo personalizado sob demanda</li>';

  // Format answers table
  const answersRows = Object.entries(record.answers || {})
    .filter(([k]) => k !== 'q_observacoes_dra')
    .map(([key, val]) => {
      const cleanKey = key.replace(/^q_/, '').replace(/_/g, ' ').toUpperCase();
      const cleanVal = Array.isArray(val) ? val.join(', ') : String(val);
      return `<tr>
        <td style="padding: 6px 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold; width: 35%;">${cleanKey}</td>
        <td style="padding: 6px 10px; border: 1px solid #e5e7eb;">${cleanVal}</td>
      </tr>`;
    }).join('');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Prontuário e Ficha de Anamnese - ${patientName}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; line-height: 1.5; font-size: 11pt; }
        h1 { color: #881337; font-size: 18pt; margin-bottom: 4px; text-transform: uppercase; border-bottom: 2px solid #f43f5e; padding-bottom: 6px; }
        h2 { color: #9f1239; font-size: 13pt; margin-top: 18px; margin-bottom: 6px; background-color: #fff1f2; padding: 6px; border-left: 4px solid #e11d48; }
        p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .footer-sign { margin-top: 40px; border-top: 1px solid #9ca3af; padding-top: 10px; text-align: center; width: 320px; margin-left: auto; margin-right: auto; }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0;">CLÍNICA DE MASSOTERAPIA & ESTÉTICA CORPORAL</h1>
        <p style="font-size: 13pt; color: #be123c; font-weight: bold; margin: 2px 0;">DRA. YASMIN OLIVEIRA</p>
        <p style="font-size: 9pt; color: #6b7280; margin: 0;">Registro Profissional & Avaliação Clínica Especializada | Contato: (11) 99123-4567</p>
      </div>

      <h2>1. IDENTIFICAÇÃO DO PACIENTE</h2>
      <table>
        <tr>
          <td style="padding: 6px; border: 1px solid #e5e7eb; width: 50%;"><b>Nome:</b> ${patientName}</td>
          <td style="padding: 6px; border: 1px solid #e5e7eb; width: 50%;"><b>Data da Avaliação:</b> ${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #e5e7eb;"><b>Telefone:</b> ${patientPhone}</td>
          <td style="padding: 6px; border: 1px solid #e5e7eb;"><b>E-mail:</b> ${patientEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #e5e7eb;"><b>Profissão:</b> ${patient?.occupation || 'Não informada'}</td>
          <td style="padding: 6px; border: 1px solid #e5e7eb;"><b>Contato Emergência:</b> ${patient?.emergencyContact || 'Não informado'} (${patient?.emergencyPhone || '-'})</td>
        </tr>
      </table>

      <h2>2. OBJETIVO PRINCIPAL & PREFERÊNCIA DE PRESSÃO</h2>
      <p><b>Objetivo Declarado:</b> ${record.mainObjective || 'Não informado'}</p>
      <p><b>Preferência de Toque / Pressão:</b> <span style="background-color: #fce7f3; padding: 2px 8px; border-radius: 4px; font-weight: bold; color: #9d174d;">${record.pressurePreference}</span></p>

      <h2>3. SEGURANÇA CLÍNICA & CONTRAINDICAÇÕES</h2>
      ${alertsHtml}

      <h2>4. ÁREAS CRÍTICAS E MAPA CORPORAL</h2>
      <ul>
        ${bodyAreasHtml}
      </ul>

      <h2>5. RESPOSTAS DO QUESTIONÁRIO ESPECIALIZADO</h2>
      <table>
        ${answersRows}
      </table>

      <h2>6. CONDUTA CLÍNICA & OBSERVAÇÕES DA DRA. YASMIN</h2>
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 4px; margin-top: 8px;">
        <p style="font-style: italic;">${record.answers?.q_observacoes_dra || record.clinicalObservations || 'Avaliação sem observações adicionais.'}</p>
      </div>

      <h3 style="margin-top: 14px; color: #374151;">Técnicas Indicadas no Plano de Tratamento:</h3>
      <ul>
        ${techniquesHtml}
      </ul>

      <div class="footer-sign">
        <p style="margin: 0; font-weight: bold;">Dra. Yasmin Oliveira</p>
        <p style="margin: 0; font-size: 9pt; color: #4b5563;">Massoterapeuta & Esteta Corporal</p>
        <p style="margin: 0; font-size: 8pt; color: #9ca3af;">Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Anamnese_${patientName.replace(/\s+/g, '_')}_DraYasmin.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Baixa o arquivo JSON e Markdown com a estrutura de integração completa do servidor e MongoDB Atlas
 */
export function downloadBackendDocumentationFile() {
  const fileData = {
    projeto: "Sistema de Anamnese e Prontuários - Dra. Yasmin",
    clinica: "Massoterapia e Estética Corporal",
    dataCriacao: "2026-09-06",
    bancoDeDados: {
      tipo: "MongoDB Atlas (Nuvem)",
      driverRecomendado: "mongoose",
      versaoNode: ">= 18.x"
    },
    guiaMongoAtlas: MONGO_ATLAS_GUIDE.steps,
    rotasEPayloads: API_ENDPOINTS_DOCS,
    codigoServidorJs: MONGO_ATLAS_GUIDE.serverCodeJs,
    arquivoEnvExemplo: MONGO_ATLAS_GUIDE.envFileExample
  };

  const jsonString = JSON.stringify(fileData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'estrutura-servidor-mongo-atlas-dra-yasmin.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Dispara a impressão otimizada em PDF com cabeçalho timbrado
 */
export function printAnamnesisPdf() {
  window.print();
}
