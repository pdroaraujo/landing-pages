import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type State = { phase: 'loading' } | { phase: 'redirecting' } | { phase: 'vcard'; destination: string } | { phase: 'wifi' } | { phase: 'error'; message: string };

export default function TapRedirect() {
  const { code } = useParams();
  const [state, setState] = useState<State>({ phase: 'loading' });

  useEffect(() => {
    if (!code) return;
    supabase.functions
      .invoke('tap', { body: { code } })
      .then(({ data, error }) => {
        if (error || !data || (data as { error?: string }).error) {
          setState({ phase: 'error', message: 'Placa não encontrada ou desativada.' });
          return;
        }
        const { destination, link_type } = data as { destination: string; link_type: string };
        if (link_type === 'wifi') {
          setState({ phase: 'wifi' });
          return;
        }
        if (link_type === 'vcard') {
          setState({ phase: 'vcard', destination });
          const blob = new Blob([destination], { type: 'text/vcard' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'contato.vcf';
          a.click();
          return;
        }
        setState({ phase: 'redirecting' });
        window.location.replace(destination);
      })
      .catch(() => setState({ phase: 'error', message: 'Falha ao carregar. Tente novamente.' }));
  }, [code]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans flex items-center justify-center px-6 text-center">
      <div>
        <img src="/logo.png" alt="S7" className="mx-auto mb-8 h-16 w-16 object-contain" />
        {(state.phase === 'loading' || state.phase === 'redirecting') && (
          <p className="text-sm text-white/50">Abrindo…</p>
        )}
        {state.phase === 'vcard' && (
          <p className="text-sm text-white/60">Contato salvo! Se o download não começou, <a href={URL.createObjectURL(new Blob([state.destination], { type: 'text/vcard' }))} download="contato.vcf" className="text-[#fe0000] underline">clique aqui</a>.</p>
        )}
        {state.phase === 'wifi' && (
          <p className="text-sm text-white/60">Essa placa conecta seu Wi-Fi automaticamente ao encostar o celular.</p>
        )}
        {state.phase === 'error' && <p className="text-sm text-[#ff5a5a]">{state.message}</p>}
      </div>
    </div>
  );
}
