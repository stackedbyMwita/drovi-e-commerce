"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Address = {
  id: string;
  county: string;
  town: string;
  area: string;
  is_default: boolean;
};

type AddressForm = {
  county: string;
  town: string;
  area: string;
};

const EMPTY_FORM: AddressForm = { county: "", town: "", area: "" };

export default function AddressesPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null); // address id or "new"
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<AddressForm>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchAddresses() {
    if (!user) return;
    const { data } = await supabase
      .from("addresses")
      .select("id, county, town, area, is_default")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    setAddresses(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchAddresses(); }, [user]);

  function validate(): boolean {
    const e: Partial<AddressForm> = {};
    if (!form.county.trim()) e.county = "Required";
    if (!form.town.trim())   e.town   = "Required";
    if (!form.area.trim())   e.area   = "Required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function startEdit(address: Address) {
    setEditing(address.id);
    setForm({ county: address.county, town: address.town, area: address.area });
    setFormErrors({});
  }

  function startNew() {
    setEditing("new");
    setForm(EMPTY_FORM);
    setFormErrors({});
  }

  function cancelEdit() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);

    if (editing === "new") {
      // First address becomes default automatically
      const isFirst = addresses.length === 0;
      await supabase.from("addresses").insert({
        user_id: user!.id,
        county: form.county.trim(),
        town: form.town.trim(),
        area: form.area.trim(),
        postal_code: null,
        is_default: isFirst,
      });
    } else {
      await supabase.from("addresses").update({
        county: form.county.trim(),
        town: form.town.trim(),
        area: form.area.trim(),
      }).eq("id", editing!);
    }

    setSaving(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    await fetchAddresses();
  }

  async function handleSetDefault(id: string) {
    // Remove default from all, then set on this one
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user!.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    await fetchAddresses();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await supabase.from("addresses").delete().eq("id", id);
    setDeletingId(null);
    await fetchAddresses();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-primary" />
          <h1 className="font-serif text-2xl font-bold text-foreground">Saved Addresses</h1>
        </div>
        {editing === null && (
          <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={startNew}>
            Add New
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2].map(i => <div key={i} className="h-24 bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* ── Add / Edit form ── */}
          {editing !== null && (
            <div className="border-2 border-primary p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-foreground">
                  {editing === "new" ? "New Address" : "Edit Address"}
                </h3>
                <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(["county", "town", "area"] as const).map((field) => (
                  <div key={field} className={cn("flex flex-col gap-1.5", field === "area" && "sm:col-span-2")}>
                    <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground capitalize">
                      {field}
                    </label>
                    <input
                      type="text"
                      value={form[field]}
                      onChange={(e) => {
                        setForm(f => ({ ...f, [field]: e.target.value }));
                        if (formErrors[field]) setFormErrors(e => ({ ...e, [field]: undefined }));
                      }}
                      placeholder={field === "county" ? "Nairobi" : field === "town" ? "Westlands" : "Sarit Centre area"}
                      className={cn(
                        "w-full px-4 py-3 font-sans text-sm bg-background text-foreground border outline-none transition-colors placeholder:text-muted-foreground",
                        formErrors[field] ? "border-destructive" : "border-border focus:border-primary"
                      )}
                    />
                    {formErrors[field] && (
                      <p className="text-[11px] text-destructive">{formErrors[field]}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <Button variant="primary" size="sm" loading={saving} icon={<Check size={14} />} onClick={handleSave}>
                  Save Address
                </Button>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
              </div>
            </div>
          )}

          {/* ── Address cards ── */}
          {addresses.length === 0 && editing === null ? (
            <div className="text-center py-12 border border-dashed border-border">
              <MapPin size={28} className="text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-sans text-sm text-muted-foreground mb-3">No saved addresses yet</p>
              <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={startNew}>
                Add Address
              </Button>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className={cn(
                  "border p-4 md:p-5 flex items-start justify-between gap-4 transition-colors",
                  address.is_default ? "border-primary bg-accent/30" : "border-border"
                )}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <MapPin size={16} className={cn("mt-0.5 shrink-0", address.is_default ? "text-primary" : "text-muted-foreground")} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {address.is_default && (
                        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary border border-primary px-2 py-0.5">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-sm font-semibold text-foreground">
                      {address.area}, {address.town}
                    </p>
                    <p className="font-sans text-sm text-muted-foreground">{address.county}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="px-2.5 py-1.5 text-[11px] font-sans font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary border border-border hover:border-primary transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(address)}
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}