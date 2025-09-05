import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/route-handler';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerSupabaseClient();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const instanceName = formData.get('instanceName') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 });
    }

    if (!instanceName) {
      return NextResponse.json({ error: 'Nome da instância não fornecido' }, { status: 400 });
    }

    // Validar tipo de arquivo (foto ou vídeo)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não suportado. Use imagens (JPEG, PNG, GIF, WebP) ou vídeos (MP4, AVI, MOV, WMV, WebM)' 
      }, { status: 400 });
    }

    // Criar estrutura de pastas: user_id/instance_name/date
    const today = new Date();
    const dateFolder = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Determinar extensão do arquivo
    const fileExtension = file.name.split('.').pop() || (file.type.startsWith('image/') ? 'jpg' : 'mp4');
    
    // Caminho do arquivo no storage
    const filePath = `${user.id}/${instanceName}/${dateFolder}/Automato.${fileExtension}`;
    
    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    
    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('Automato')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true // Sobrescrever se já existir
      });
    
    if (error) {
      console.error('Erro no upload:', error);
      return NextResponse.json({ error: 'Erro ao fazer upload do arquivo' }, { status: 500 });
    }
    
    // Obter URL pública do arquivo
    const { data: publicUrlData } = supabase.storage
      .from('Automato')
      .getPublicUrl(filePath);
    
    return NextResponse.json({
      success: true,
      filePath: filePath,
      publicUrl: publicUrlData.publicUrl,
      message: 'Arquivo enviado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}