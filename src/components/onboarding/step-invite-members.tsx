"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Users, Plus, Trash2 } from "lucide-react";

export interface InvitedMember {
  name: string;
  email: string;
  role: string;
}

interface StepInviteMembersProps {
  defaultValues?: InvitedMember[];
  onNext: (members: InvitedMember[]) => void;
  onBack: () => void;
}

const MEMBER_ROLES = [
  { value: "tenant_member", label: "Member" },
  { value: "developer", label: "Developer" },
  { value: "billing_admin", label: "Billing Admin" },
  { value: "auditor", label: "Auditor" },
  { value: "workflow_manager", label: "Workflow Manager" },
];

const emptyMember = (): InvitedMember => ({ name: "", email: "", role: "tenant_member" });

export function StepInviteMembers({ defaultValues, onNext, onBack }: StepInviteMembersProps) {
  const [members, setMembers] = useState<InvitedMember[]>(
    defaultValues && defaultValues.length > 0 ? defaultValues : [emptyMember()],
  );
  const [errors, setErrors] = useState<Record<number, string>>({});

  const addMember = () => setMembers((prev) => [...prev, emptyMember()]);

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const updateMember = (index: number, field: keyof InvitedMember, value: string) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  const handleNext = () => {
    // Filter out empty rows
    const filledMembers = members.filter((m) => m.email.trim() !== "");

    // Validate emails
    const newErrors: Record<number, string> = {};
    filledMembers.forEach((m, i) => {
      if (m.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)) {
        newErrors[i] = "Invalid email address";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext(filledMembers);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15">
          <Users className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--gf-text-primary)" }}>
            Invite Team Members
          </h2>
          <p className="text-sm" style={{ color: "var(--gf-text-secondary)" }}>
            Add people to collaborate with. You can skip this step.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {members.map((member, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-lg border border-input p-3"
          >
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={member.name}
                    onChange={(e) => updateMember(index, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={member.email}
                    onChange={(e) => updateMember(index, "email", e.target.value)}
                  />
                  {errors[index] && (
                    <p className="text-xs text-red-400">{errors[index]}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role</Label>
                  <Select
                    value={member.role}
                    onChange={(val) => updateMember(index, "role", val)}
                    options={MEMBER_ROLES}
                    placeholder="Select role"
                  />
                </div>
              </div>
            </div>
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => removeMember(index)}
                className="mt-6 rounded-md p-1.5 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addMember}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add Another
      </Button>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => onNext([])}>
            Skip
          </Button>
          <Button type="button" onClick={handleNext}>
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}
