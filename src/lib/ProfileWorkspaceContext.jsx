import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { getBackendProvider } from "@/api/accountClient";
import { listAccessibleProfiles } from "@/api/profileWorkspaceClient";

const ProfileWorkspaceContext = createContext(null);
const SELECTED_PROFILE_KEY = "bingoo:selected-profile-id";

function readSavedProfileId() {
  try {
    return localStorage.getItem(SELECTED_PROFILE_KEY) || null;
  } catch {
    return null;
  }
}

function saveProfileId(profileId) {
  try {
    if (profileId) localStorage.setItem(SELECTED_PROFILE_KEY, profileId);
    else localStorage.removeItem(SELECTED_PROFILE_KEY);
  } catch {
    // Storage can be unavailable in private or embedded browser contexts.
  }
}

export function ProfileWorkspaceProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [selectedProfileId, setSelectedProfileId] = useState(readSavedProfileId);

  const {
    data: profiles = [],
    isLoading,
    error,
    refetch: refetchProfiles,
  } = useQuery({
    queryKey: ["my-profile", getBackendProvider(), user?.id],
    queryFn: listAccessibleProfiles,
    enabled: isAuthenticated && !!user?.id,
    staleTime: 30_000,
  });

  const primaryProfile = useMemo(() => {
    if (!profiles.length) return null;
    return (
      profiles.find((profile) => profile.id === user?.default_profile_id) ||
      profiles.find((profile) => profile.is_primary) ||
      profiles[0]
    );
  }, [profiles, user?.default_profile_id]);

  const selectedProfile = useMemo(() => {
    if (!profiles.length) return null;
    return profiles.find((profile) => profile.id === selectedProfileId) || primaryProfile;
  }, [profiles, primaryProfile, selectedProfileId]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user?.id || profiles.length === 0) {
      setSelectedProfileId(null);
      saveProfileId(null);
      return;
    }

    const validatedId = selectedProfile?.id || primaryProfile?.id || null;
    if (validatedId && validatedId !== selectedProfileId) {
      setSelectedProfileId(validatedId);
      saveProfileId(validatedId);
    }
  }, [
    isAuthenticated,
    isLoading,
    primaryProfile?.id,
    profiles.length,
    selectedProfile?.id,
    selectedProfileId,
    user?.id,
  ]);

  const selectProfile = useCallback((profileId) => {
    if (profileId === null) {
      setSelectedProfileId(null);
      return true;
    }
    const allowed = profiles.some((profile) => profile.id === profileId);
    if (!allowed) return false;
    setSelectedProfileId(profileId);
    saveProfileId(profileId);
    return true;
  }, [profiles]);

  const value = useMemo(() => ({
    profiles,
    selectedProfileId,
    selectedProfile,
    primaryProfile,
    isLoading,
    error,
    selectProfile,
    refetchProfiles,
  }), [
    profiles,
    selectedProfileId,
    selectedProfile,
    primaryProfile,
    isLoading,
    error,
    selectProfile,
    refetchProfiles,
  ]);

  return (
    <ProfileWorkspaceContext.Provider value={value}>
      {children}
    </ProfileWorkspaceContext.Provider>
  );
}

export function useProfileWorkspace() {
  const context = useContext(ProfileWorkspaceContext);
  if (!context) {
    throw new Error("useProfileWorkspace must be used within ProfileWorkspaceProvider");
  }
  return context;
}
