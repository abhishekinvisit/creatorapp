import { useState } from "react";
import { X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { applicationsApi } from "@/lib/api";
import { toast } from "sonner";

export const ApplyDialog = ({ opportunity, onClose, onApplied }) => {
  const { user, addApplication } = useApp();
  const [note, setNote] = useState("");
  const [counterAmount, setCounterAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const hasRange = opportunity.payout_min > 0 || opportunity.payoutMin > 0;

  const handleApply = async () => {
    setLoading(true);
    try {
      const counter = counterAmount ? parseInt(counterAmount) : null;
      const appRow = await applicationsApi.apply(opportunity.id, note, counter);
      addApplication({
        id: appRow.id,
        opportunityId: appRow.opportunity_id,
        brandName: appRow.brand_name || opportunity.brandName || opportunity.brand_name || "",
        brandId: appRow.brand_id || opportunity.brandId || opportunity.brand_id || null,
        opportunityTitle: appRow.opportunity_title || opportunity.title || "",
        appliedOn: new Date(appRow.applied_at || Date.now()).toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric",
        }),
        status: "applied",
        note: appRow.note || note || "",
        counterAmount: appRow.counter_amount || counter,
      });
      onApplied();
    } catch (err) {
      if (err.message?.toLowerCase().includes("already")) {
        toast.error("You've already applied to this opportunity");
      } else {
        toast.error(err.message || "Failed to apply");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="apply-dialog" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-up" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display font-black text-2xl text-[#0A0A0A] tracking-tight">Send my profile</h2>
            <p className="text-sm text-[#525252] mt-1 font-medium">Your Rytspot profile will be shared with this brand.</p>
          </div>
          <button data-testid="apply-close" onClick={onClose} className="w-9 h-9 rounded-full bg-[#F3F3F3] flex items-center justify-center flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Profile preview */}
        <div className="bg-[#F9F9F8] rounded-2xl p-4 flex items-center gap-4 mb-5 border border-[#E5E5E5]">
          <img src={user.creator.avatar} alt={user.creator.name} className="w-14 h-14 rounded-full object-cover" />
          <div className="flex-1">
            <p className="font-display font-bold text-base text-[#0A0A0A]">{user.creator.name}</p>
            <p className="text-xs text-[#525252] font-medium">{user.creator.handle}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Followers", value: user.creator.followers },
            { label: "Collabs", value: user.creator.collaborations },
            { label: "Niche", value: (user.creator.category || [])[0] || "—" },
          ].map((s) => (
            <div key={s.label} className="bg-[#F9F9F8] rounded-2xl p-3 text-center border border-[#E5E5E5]">
              <p className="font-display font-black text-lg text-[#0A0A0A]">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#525252] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#525252] mb-2">Cover Note (Optional)</p>
        <p className="text-xs text-[#525252] mb-2 font-medium">Tell the brand why you're a great fit.</p>
        <textarea
          data-testid="cover-note"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 300))}
          rows={4}
          placeholder="Write your note here..."
          className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F8] border border-[#E5E5E5] outline-none focus:border-[#0A0A0A] text-sm font-medium resize-none"
        />
        <p className="text-xs text-[#525252] text-right mt-1 font-medium">{note.length}/300</p>

        {/* Counter offer */}
        {hasRange && (
          <div className="mt-4">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#525252] mb-1">Counter Offer ₹ (Optional)</p>
            <p className="text-xs text-[#525252] mb-2 font-medium">
              Budget range: ₹{(opportunity.payout_min || opportunity.payoutMin || 0).toLocaleString("en-IN")} – ₹{(opportunity.payout_max || opportunity.payoutMax || 0).toLocaleString("en-IN")}. Propose your rate.
            </p>
            <input
              data-testid="counter-amount"
              type="number"
              value={counterAmount}
              onChange={(e) => setCounterAmount(e.target.value)}
              placeholder="Enter your rate in ₹"
              className="w-full px-4 py-3 rounded-2xl bg-[#F9F9F8] border border-[#E5E5E5] outline-none focus:border-[#0A0A0A] text-sm font-medium"
            />
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button data-testid="apply-cancel" onClick={onClose} className="flex-1 py-4 rounded-full border border-[#E5E5E5] font-bold text-sm">
            Cancel
          </button>
          <button
            data-testid="apply-submit"
            onClick={handleApply}
            disabled={loading}
            className="flex-1 py-4 rounded-full bg-[#0A0A0A] text-white font-bold text-sm hover:bg-[#E25238] active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};
