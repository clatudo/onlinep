import { supabaseAdmin } from './supabase/admin';
import { sendWelcomeEmail } from './mail';

/**
 * Adiciona um e-mail à fila de reenvio
 */
export async function enqueueEmail(data: {
  email: string;
  name: string;
  link: string;
  subject: string;
  type?: string;
}) {
  try {
    const { error } = await supabaseAdmin.from('email_queue').insert({
      email: data.email,
      name: data.name,
      link: data.link,
      subject: data.subject,
      type: data.type || 'welcome',
      status: 'pending',
      attempts: 0
    });

    if (error) throw error;
    console.log(`[EMAIL QUEUE] E-mail para ${data.email} enfileirado.`);
  } catch (err) {
    console.error("[EMAIL QUEUE] Erro ao enfileirar e-mail:", err);
  }
}

/**
 * Processa a fila de e-mails pendentes
 */
export async function processEmailQueue() {
  try {
    // Busca e-mails pendentes com menos de 10 tentativas
    const { data: pending, error } = await supabaseAdmin
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 10)
      .limit(5); // Processa de 5 em 5 para não sobrecarregar

    if (error) throw error;
    if (!pending || pending.length === 0) return { processed: 0 };

    let successCount = 0;

    for (const item of pending) {
      console.log(`[EMAIL WORKER] Tentando reenvio para ${item.email} (Tentativa ${item.attempts + 1})...`);
      
      const result = await sendWelcomeEmail(item.email, item.name, item.link);

      if (result.success) {
        await supabaseAdmin
          .from('email_queue')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', item.id);
        successCount++;
      } else {
        await supabaseAdmin
          .from('email_queue')
          .update({ 
            attempts: item.attempts + 1, 
            last_error: result.error?.message || 'Unknown Error',
            updated_at: new Date().toISOString() 
          })
          .eq('id', item.id);
      }
    }

    return { processed: pending.length, success: successCount };
  } catch (err) {
    console.error("[EMAIL WORKER] Erro crítico no processamento da fila:", err);
    return { error: err };
  }
}
