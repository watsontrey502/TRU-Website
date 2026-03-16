"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { hapticSuccess } from "@/lib/haptics";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  instagram: string;
  neighborhood: string;
  status: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", instagram: "", neighborhood: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, instagram, neighborhood, status")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          instagram: data.instagram ?? "",
          neighborhood: data.neighborhood ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        instagram: form.instagram,
        neighborhood: form.neighborhood,
      })
      .eq("id", user.id);

    setSaving(false);
    toast("Profile saved");
    hapticSuccess();
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white py-3.5 px-4 text-[15px] text-black placeholder:text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-gold focus:ring-gold/20";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-black mb-2">
          Your Profile
        </h1>
        <p className="text-stone">Manage your account details.</p>
      </div>

      <div className="max-w-lg">
        {/* Status */}
        {profile?.status && (
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-600 mb-2">Membership Status</p>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
              profile.status === "approved"
                ? "bg-black/10 text-black"
                : profile.status === "pending"
                  ? "bg-gold/10 text-gold"
                  : "bg-red-50 text-red-600"
            }`}>
              {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
            </span>
          </div>
        )}

        {/* Email (read-only) */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-600 mb-2 block">Email</label>
          <input
            type="email"
            value={profile?.email ?? ""}
            disabled
            className={`${inputClass} bg-gray-50 text-stone cursor-not-allowed`}
          />
        </div>

        {/* Editable fields */}
        <div className="space-y-5 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Instagram</label>
            <input
              type="text"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="@yourusername"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Neighborhood</label>
            <input
              type="text"
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
              placeholder="e.g. East Nashville"
              className={inputClass}
            />
          </div>
        </div>

        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="px-8 py-3.5 rounded-xl bg-gold text-white font-semibold text-sm tracking-wide transition-colors hover:bg-gold cursor-pointer shadow-lg shadow-gold/15 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>
      </div>
    </>
  );
}
