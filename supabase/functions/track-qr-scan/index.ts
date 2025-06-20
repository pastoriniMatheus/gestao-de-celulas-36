
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { keyword, eventId } = await req.json()
    
    if (!keyword && !eventId) {
      return new Response(
        JSON.stringify({ error: 'Keyword ou eventId é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obter informações do request
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'

    // Se tem eventId, é um evento
    if (eventId) {
      console.log('Processando scan de evento:', eventId)
      
      // Buscar o evento
      const { data: event, error: fetchError } = await supabaseClient
        .from('events')
        .select('id, active, scan_count')
        .eq('id', eventId)
        .eq('active', true)
        .single()

      if (fetchError || !event) {
        console.log('Evento não encontrado ou inativo:', fetchError)
        return new Response(
          JSON.stringify({ error: 'Evento não encontrado ou inativo' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Incrementar contador do evento
      const { error: updateError } = await supabaseClient
        .from('events')
        .update({ scan_count: (event.scan_count || 0) + 1 })
        .eq('id', eventId)

      if (updateError) {
        console.error('Erro ao incrementar contador do evento:', updateError)
        return new Response(
          JSON.stringify({ error: 'Erro interno' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Scan de evento registrado com sucesso')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Scan de evento registrado com sucesso' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Se não tem eventId, processar como QR code normal
    if (keyword) {
      console.log('Processando scan de QR code:', keyword)
      
      // Buscar o QR code pela keyword
      const { data: qrCode, error: fetchError } = await supabaseClient
        .from('qr_codes')
        .select('id, active')
        .eq('keyword', keyword)
        .eq('active', true)
        .single()

      if (fetchError || !qrCode) {
        console.log('QR code não encontrado ou inativo:', fetchError)
        return new Response(
          JSON.stringify({ error: 'QR code não encontrado ou inativo' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Chamar a função para incrementar o contador
      const { error: incrementError } = await supabaseClient
        .rpc('increment_qr_scan_count', {
          qr_id: qrCode.id,
          user_ip: clientIP !== 'unknown' ? clientIP : null,
          user_agent_string: userAgent
        })

      if (incrementError) {
        console.error('Erro ao incrementar contador:', incrementError)
        return new Response(
          JSON.stringify({ error: 'Erro interno' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Scan de QR code registrado com sucesso')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Scan registrado com sucesso' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
