"use client";

import { useState } from "react";
import { User, Phone, Mail, Save } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone]       = useState(profile?.phone ?? "");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  async function handleSave() {
    setError("");
    const phoneRx = /^(?:\+254|0)[17]\d{8}$/;
    if (phone && !phoneRx.test(phone.replace(/\s/g, ""))) {
      setError("Enter a valid Kenyan phone number");
      return;
    }
    setSaving(true);
    const { error: err } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() || null })
      .eq("id", user!.id);

    setSaving(false);
    if (err) { setError(err.message); return; }
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
        <User size={18} className="text-primary" />
        <h1 className="font-serif text-2xl font-bold text-foreground">My Profile</h1>
      </div>

      <div className="flex flex-col gap-5 max-w-md">
        {/* Full name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Wanjiku"
            className="w-full px-4 py-3 font-sans text-sm bg-background text-foreground border border-border focus:border-primary outline-none transition-colors placeholder:text-muted-foreground"
          />
        </div>

        {/* Email (read-only) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5">
            Email
            <span className="text-muted-foreground font-normal normal-case tracking-normal">(cannot change)</span>
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={user?.email ?? ""}
              readOnly
              className="w-full pl-9 pr-4 py-3 font-sans text-sm bg-muted text-muted-foreground border border-border outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
            Phone Number
          </label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0712 345 678"
              className={cn(
                "w-full pl-9 pr-4 py-3 font-sans text-sm bg-background text-foreground border outline-none transition-colors placeholder:text-muted-foreground",
                error ? "border-destructive" : "border-border focus:border-primary"
              )}
            />
          </div>
          {error && <p className="text-[11px] text-destructive">{error}</p>}
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Save size={14} />}
          onClick={handleSave}
          loading={saving}
          className="w-fit"
        >
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}