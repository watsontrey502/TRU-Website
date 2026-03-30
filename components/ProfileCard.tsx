"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export interface ProfileCardProfile {
  id: string;
  first_name: string;
  age?: number;
  bio?: string;
  interests?: string[];
  drinking?: string;
  smoking?: string;
  intentions?: string;
  instagram?: string;
  neighborhood?: string;
  work?: string;
  avatar_upload_path?: string;
  verification_status?: string;
}

interface ProfileCardProps {
  profile: ProfileCardProfile;
  variant?: "full" | "compact";
  onSelect?: () => void;
  selected?: boolean;
  className?: string;
}

function getAvatarUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
}

/* ---- Lifestyle row icons (inline SVGs to avoid external deps) ---- */

function WineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2h8l-1 7a5 5 0 0 1-10 0L8 2z" />
      <path d="M12 15v7" />
      <path d="M8 22h8" />
    </svg>
  );
}

function NoSmokingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="14" width="16" height="4" rx="1" />
      <path d="M19 14v4" />
      <path d="M22 14v4" />
      <path d="M19 10c0-1.5-1-3-3-3 0-2-1.5-3-3-3" />
      <path d="M22 10c0-1.5-1-3-3-3" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-semibold tracking-wide uppercase border border-gold/30">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      Verified
    </span>
  );
}

/* ---- Lifestyle item row ---- */

function LifestyleItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-white/60 text-sm">
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

/* ---- Main Component ---- */

export default function ProfileCard({
  profile,
  variant = "full",
  onSelect,
  selected = false,
  className = "",
}: ProfileCardProps) {
  const avatarUrl = getAvatarUrl(profile.avatar_upload_path);
  const isCompact = variant === "compact";
  const initial = profile.first_name?.[0]?.toUpperCase() ?? "?";

  const lifestyleItems: { icon: React.ReactNode; label: string }[] = [];
  if (profile.drinking) {
    lifestyleItems.push({
      icon: <WineIcon className="w-4 h-4" />,
      label: profile.drinking,
    });
  }
  if (profile.smoking) {
    lifestyleItems.push({
      icon: <NoSmokingIcon className="w-4 h-4" />,
      label: profile.smoking,
    });
  }
  if (profile.intentions) {
    lifestyleItems.push({
      icon: <HeartIcon className="w-4 h-4" />,
      label: profile.intentions,
    });
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={onSelect}
      className={`
        rounded-2xl overflow-hidden border transition-colors duration-200
        ${
          selected
            ? "border-gold/50 shadow-lg shadow-gold/10"
            : "border-white/[0.08] hover:border-white/[0.15]"
        }
        bg-white/[0.04]
        ${onSelect ? "cursor-pointer" : ""}
        ${isCompact ? "" : "max-w-md mx-auto w-full"}
        ${className}
      `}
    >
      {/* ---- Photo ---- */}
      <div
        className={`relative w-full overflow-hidden ${
          isCompact ? "aspect-square" : "aspect-[3/4]"
        }`}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={profile.first_name}
            fill
            className="object-cover"
            sizes={isCompact ? "(max-width: 768px) 50vw, 33vw" : "(max-width: 768px) 100vw, 448px"}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-gold/5 flex items-center justify-center">
            <span className="font-serif text-6xl font-bold text-gold/60">
              {initial}
            </span>
          </div>
        )}

        {/* Gradient overlay at bottom of photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Name + age overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end gap-2 flex-wrap">
            <h3 className="font-serif text-2xl font-bold text-white leading-tight">
              {profile.first_name}
              {profile.age != null && (
                <span className="text-white/70 font-normal">, {profile.age}</span>
              )}
            </h3>
            {profile.verification_status === "verified" && <VerifiedBadge />}
          </div>
          {profile.work && (
            <p className="text-white/60 text-sm mt-1">{profile.work}</p>
          )}
        </div>

        {/* Selected checkmark overlay */}
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-lg"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* ---- Body ---- */}
      <div className={isCompact ? "p-3" : "p-5 space-y-4"}>
        {/* Bio */}
        {profile.bio && !isCompact && (
          <p className="text-white/70 text-sm leading-relaxed">{profile.bio}</p>
        )}

        {/* Interests pills */}
        {profile.interests && profile.interests.length > 0 && !isCompact && (
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20"
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* Lifestyle section */}
        {lifestyleItems.length > 0 && !isCompact && (
          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/30">
              Lifestyle
            </p>
            <div className="space-y-1.5">
              {lifestyleItems.map((item, i) => (
                <LifestyleItem key={i} icon={item.icon} label={item.label} />
              ))}
            </div>
          </div>
        )}

        {/* Neighborhood */}
        {profile.neighborhood && !isCompact && (
          <div className="flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5 text-gold/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span className="text-white/50 text-xs font-medium">
              {profile.neighborhood}
            </span>
          </div>
        )}

        {/* Instagram */}
        {profile.instagram && !isCompact && (
          <div className="flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5 text-white/40"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            <span className="text-white/40 text-xs">
              @{profile.instagram.replace(/^@/, "")}
            </span>
          </div>
        )}

        {/* Compact variant: show neighborhood + instagram inline */}
        {isCompact && (
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {profile.neighborhood && (
              <span className="text-white/40 text-[11px]">
                {profile.neighborhood}
              </span>
            )}
            {profile.instagram && (
              <span className="text-gold/50 text-[11px]">
                @{profile.instagram.replace(/^@/, "")}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
