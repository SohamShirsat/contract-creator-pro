import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ContractProvider, useContract } from "@/lib/contract";
import { Stepper } from "@/components/wizard/Stepper";
import { Step1Setup } from "@/components/wizard/Step1Setup";
import { Step2Pricing } from "@/components/wizard/Step2Pricing";
import { Step3Addons } from "@/components/wizard/Step3Addons";
import { Step4Policies } from "@/components/wizard/Step4Policies";
import { Step5Tax } from "@/components/wizard/Step5Tax";
import { Step6Info } from "@/components/wizard/Step6Info";
import { Step7Preview } from "@/components/wizard/Step7Preview";
import { SuccessPopup } from "@/components/wizard/SuccessPopup";
import { NotesPanel } from "@/components/wizard/NotesPanel";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  return (
    <ContractProvider>
      <Wizard />
    </ContractProvider>
  );
}

function Wizard() {
  const { step, setStep, state } = useContract();
  const [success, setSuccess] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30, background: "white",
        borderBottom: "1px solid var(--color-border)",
        padding: "16px 50px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "var(--color-primary)" }}>Sembark</div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>Contract creation</div>
        <div style={{
          width: 36, height: 36, borderRadius: 999, background: "var(--color-primary)",
          color: "white", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 600,
        }}>AS</div>
      </header>

      <Stepper />

      <main style={{ maxWidth: 1340, margin: "0 auto", padding: "32px 50px 120px" }}>
        {step === 1 && <Step1Setup />}
        {step === 2 && <Step2Pricing />}
        {step === 3 && <Step3Addons />}
        {step === 4 && <Step4Policies />}
        {step === 5 && <Step5Tax />}
        {step === 6 && <Step6Info />}
        {step === 7 && <Step7Preview />}
      </main>

      {/* Footer */}
      <footer style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: "white",
        borderTop: "1px solid var(--color-border)", padding: "16px 50px",
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 20,
      }}>
        <button className="cc-btn cc-btn-outline cc-btn-lg" disabled={step === 1} onClick={() => setStep(step - 1)}>
          Back
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="cc-btn cc-btn-outline cc-btn-lg">Save as Draft</button>
          {step < 7 ? (
            <button className="cc-btn cc-btn-primary cc-btn-lg" onClick={() => setStep(step + 1)}>
              Save & Continue
            </button>
          ) : (
            <button className="cc-btn cc-btn-primary cc-btn-lg" onClick={() => setSuccess(true)}>
              Publish Contract
            </button>
          )}
        </div>
      </footer>

      <SuccessPopup open={success} onClose={() => setSuccess(false)} contractName={state.contractName} />
      <NotesPanel />
    </div>
  );
}
