"use client";

import { Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type {
  ProviderConfig,
  ProviderType,
  ToneOption,
  OutputField,
} from "@/lib/types";
import {
  TONE_DESCRIPTIONS,
  OUTPUT_FIELD_LABELS,
  OUTPUT_FIELD_DESCRIPTIONS,
  GATEWAY_MODELS,
} from "@/lib/types";

interface SettingsPanelProps {
  config: ProviderConfig;
  onChange: (config: ProviderConfig) => void;
}

const PROVIDER_OPTIONS: { value: ProviderType; label: string }[] = [
  { value: "gateway", label: "Vercel AI Gateway" },
  { value: "ollama", label: "Ollama (Local)" },
  { value: "custom", label: "Custom OpenAI-Compatible" },
];

const TONE_OPTIONS: ToneOption[] = [
  "neutral",
  "professional",
  "casual",
  "creative",
  "technical",
  "marketing",
  "custom",
];

export function SettingsPanel({ config, onChange }: SettingsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (partial: Partial<ProviderConfig>) => {
    onChange({ ...config, ...partial });
  };

  const toggleOutput = (field: OutputField) => {
    const current = config.enabledOutputs;
    if (current.includes(field)) {
      if (current.length <= 1) return;
      update({ enabledOutputs: current.filter((f) => f !== field) });
    } else {
      update({ enabledOutputs: [...current, field] });
    }
  };

  const allOutputFields = Object.keys(OUTPUT_FIELD_LABELS) as OutputField[];

  return (
    <div className="rounded-lg border bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Analysis Settings
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="flex flex-col gap-5 border-t px-4 pb-5 pt-4">
          {/* Provider */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Provider
            </Label>
            <Select
              value={config.type}
              onValueChange={(v) =>
                update({
                  type: v as ProviderType,
                  model: v === "gateway" ? "anthropic/claude-sonnet-4.6" : "",
                  baseUrl: "",
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Model
            </Label>
            {config.type === "gateway" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Select
                  value={config.model}
                  onValueChange={(v) => update({ model: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {GATEWAY_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {config.model === "custom" && (
                  <>
                    <Input
                      value={config.customModel || ""}
                      onChange={(e) => update({ customModel: e.target.value })}
                      placeholder="Model ID (e.g., openai/gpt-4.1)"
                      className="text-sm w-full"
                    />
                    <Input
                      value={config.provider || ""}
                      onChange={(e) => update({ provider: e.target.value })}
                      placeholder="Provider (optional)"
                      className="text-sm w-full"
                    />
                  </>
                )}
              </div>
            ) : (
              <Input
                value={config.model}
                onChange={(e) => update({ model: e.target.value })}
                placeholder={config.type === "ollama" ? "llava" : "model-name"}
                className="text-sm"
              />
            )}
          </div>

          {/* Base URL for Ollama / Custom */}
          {(config.type === "ollama" || config.type === "custom") && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Base URL
              </Label>
              <Input
                value={config.baseUrl || ""}
                onChange={(e) => update({ baseUrl: e.target.value })}
                placeholder={
                  config.type === "ollama"
                    ? "http://localhost:11434/v1"
                    : "https://api.example.com/v1"
                }
                className="text-sm"
              />
            </div>
          )}

          {/* API Key for Custom */}
          {config.type === "custom" && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground">
                API Key
              </Label>
              <Input
                type="password"
                value={config.apiKey || ""}
                onChange={(e) => update({ apiKey: e.target.value })}
                placeholder="sk-..."
                className="text-sm"
              />
            </div>
          )}

          <Separator />

          {/* System Message */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              System Message
            </Label>
            <Textarea
              value={config.systemMessage}
              onChange={(e) => update({ systemMessage: e.target.value })}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {/* Tone */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Description Tone
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Select
                value={config.tone}
                onValueChange={(v) => update({ tone: v as ToneOption })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      <span className="capitalize">{t}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {"- "}
                        {TONE_DESCRIPTIONS[t]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {config.tone === "custom" && (
                <Input
                  value={config.customTone || ""}
                  onChange={(e) => update({ customTone: e.target.value })}
                  placeholder="Enter custom tone description..."
                  className="text-sm w-full"
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Output Fields */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                Output Fields
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() =>
                    update({ enabledOutputs: [...allOutputFields] })
                  }
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => update({ enabledOutputs: ["title"] })}
                >
                  Reset
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {allOutputFields.map((field) => (
                <div key={field} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer min-w-[140px]">
                    <Switch
                      checked={config.enabledOutputs.includes(field)}
                      onCheckedChange={() => toggleOutput(field)}
                    />
                    <span className="text-xs text-foreground">
                      {OUTPUT_FIELD_LABELS[field]}
                    </span>
                  </label>
                  <Input
                    value={
                      config.outputDescriptions?.[field] ??
                      OUTPUT_FIELD_DESCRIPTIONS[field]
                    }
                    onChange={(e) =>
                      update({
                        outputDescriptions: {
                          ...config.outputDescriptions,
                          [field]: e.target.value,
                        },
                      })
                    }
                    className="text-xs h-7 flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
