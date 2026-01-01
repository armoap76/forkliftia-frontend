import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { fetchMe } from "./api/client";
import type { CurrentUser } from "./api/client";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      if (!user) {
        setMe(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      try {
        const profile = await fetchMe();
        if (!cancelled) setMe(profile);
      } catch (error) {
        console.error("Failed to load profile", error);
        if (!cancelled) setMe(null);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    loadMe();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const setPublicName = (public_name: string) => {
    setMe((prev) => {
      if (prev) return { ...prev, public_name };
      if (user) return { uid: user.uid, public_name };
      return prev;
    });
  };

  return {
    user,
    loading,
    me,
    publicName: me?.public_name ?? null,
    profileLoading,
    setPublicName,
  };
}
