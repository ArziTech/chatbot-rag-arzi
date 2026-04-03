"use client";

import { useState } from "react";
import { Save, Key, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserPreferences } from "@/providers/user-preferences-provider";
import { AVAILABLE_MODELS, PROVIDERS } from "@/features/settings/types";

function SettingsForm() {
  const { preferences, isLoading, updatePreferences } = useUserPreferences();
  const [saving, setSaving] = useState(false);
  const [defaultProvider, setDefaultProvider] = useState(
    preferences?.defaultProvider || "openai",
  );
  const [defaultModel, setDefaultModel] = useState(
    preferences?.defaultModel || "gpt-4o",
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const openaiKey = (
        document.getElementById("openaiKey") as HTMLInputElement
      )?.value;
      const anthropicKey = (
        document.getElementById("anthropicKey") as HTMLInputElement
      )?.value;

      await updatePreferences({
        defaultModel,
        defaultProvider,
        openaiKey: openaiKey || null,
        anthropicKey: anthropicKey || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your AI preferences and API keys
        </p>
      </div>

      {/* AI Model Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5" />
            AI Model Preferences
          </CardTitle>
          <CardDescription>
            Choose your default AI model and provider for chat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultProvider">Provider</Label>
              <Select
                value={defaultProvider}
                onValueChange={(value) => setDefaultProvider(value)}
              >
                <SelectTrigger id="defaultProvider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultModel">Model</Label>
              <Select
                value={defaultModel}
                onValueChange={(value) => setDefaultModel(value)}
              >
                <SelectTrigger id="defaultModel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="size-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Optional: Add your own API keys to use your own credits. Leave empty
            to use the default shared keys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openaiKey">OpenAI API Key</Label>
            <Input
              id="openaiKey"
              type="password"
              placeholder="sk-..."
              defaultValue=""
            />
            {preferences?.hasOpenAIKey && (
              <p className="text-xs text-muted-foreground">
                You have an OpenAI key on file
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="anthropicKey">Anthropic API Key</Label>
            <Input
              id="anthropicKey"
              type="password"
              placeholder="sk-ant-..."
              defaultValue=""
            />
            {preferences?.hasAnthropicKey && (
              <p className="text-xs text-muted-foreground">
                You have an Anthropic key on file
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || isLoading}>
              <Save className="mr-2 size-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { SettingsForm };
