import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';

declare global {
  interface Window {
    liff: {
      init: (config: { liffId: string }) => Promise<void>;
      isLoggedIn: () => boolean;
      login: () => void;
      getProfile: () => Promise<{
        userId: string;
        displayName: string;
        pictureUrl?: string;
      }>;
    };
  }
}

export function useLiff() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useUserStore((state) => state.setUser);
  const setLoading = useUserStore((state) => state.setLoading);

  useEffect(() => {
    const liffId = import.meta.env.VITE_LINE_LIFF_ID;

    if (!liffId || liffId === 'your_line_liff_id_here') {
      initWithoutLiff();
      return;
    }

    if (!window.liff) {
      const script = document.createElement('script');
      script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
      script.async = true;
      script.onload = () => initLiff(liffId);
      document.body.appendChild(script);
    } else {
      initLiff(liffId);
    }
  }, []);

  const initWithoutLiff = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          setUser(profile);
        }
      }

      setIsInitialized(true);
      setLoading(false);
    } catch (err) {
      console.error('Error initializing without LIFF:', err);
      setError('Failed to initialize');
      setLoading(false);
    }
  };

  const initLiff = async (liffId: string) => {
    try {
      await window.liff.init({ liffId });

      if (!window.liff.isLoggedIn()) {
        window.liff.login();
        return;
      }

      const profile = await window.liff.getProfile();

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('line_user_id', profile.userId)
        .maybeSingle();

      if (existingProfile) {
        setUser(existingProfile);
      } else {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            line_user_id: profile.userId,
            display_name: profile.displayName,
            picture_url: profile.pictureUrl,
            role: 'customer',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setUser(newProfile);
      }

      setIsInitialized(true);
      setLoading(false);
    } catch (err) {
      console.error('LIFF initialization failed:', err);
      setError('LIFF initialization failed');
      setLoading(false);
      initWithoutLiff();
    }
  };

  return { isInitialized, error };
}
