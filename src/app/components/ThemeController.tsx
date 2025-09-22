"use client";

import React, { useEffect, useState } from "react";
import { MantineProvider, ColorSchemeScript, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

type Settings = {
  primaryColor: string;
  darkMode: boolean;
  colorScheme: "light" | "dark" | "auto";
};

const DEFAULTS: Settings = {
  primaryColor: "#228be6",
  darkMode: true,
  colorScheme: "dark",
};

export default function ThemeController({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data?.data) {
          const s = data.data as Partial<Settings>;
          setSettings((prev) => ({
            primaryColor: s.primaryColor || prev.primaryColor,
            darkMode: typeof s.darkMode === "boolean" ? s.darkMode : prev.darkMode,
            colorScheme: (s.colorScheme as Settings["colorScheme"]) || prev.colorScheme,
          }));
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const scheme = settings.colorScheme === "auto" ? (settings.darkMode ? "dark" : "light") : settings.colorScheme;

  // Build a simple dynamic palette named "brand" from the stored hex
  // For now we reuse the same hex for all 10 shades to satisfy Mantine's requirement
  // Later we can generate real tints/shades.
  const brandShades = [
    settings.primaryColor || "#228be6",
    settings.primaryColor || "#228be6", 
    settings.primaryColor || "#228be6",
    settings.primaryColor || "#228be6",
    settings.primaryColor || "#228be6",
    settings.primaryColor || "#228be6",
    settings.primaryColor || "#228be6",
    settings.primaryColor || "#228be6",
    settings.primaryColor || "#228be6",
    settings.primaryColor || "#228be6",
  ] as const;

  const theme = createTheme({
    colors: { brand: brandShades },
    primaryColor: "brand",
  });

  return (
    <>
      <ColorSchemeScript defaultColorScheme={scheme} />
      <MantineProvider
        defaultColorScheme={scheme}
        theme={theme}
        cssVariablesResolver={(theme) => ({
          variables: {
            '--mantine-color-brand-0': theme.colors.brand[0],
            '--mantine-color-brand-1': theme.colors.brand[1],
            '--mantine-color-brand-2': theme.colors.brand[2],
            '--mantine-color-brand-3': theme.colors.brand[3],
            '--mantine-color-brand-4': theme.colors.brand[4],
            '--mantine-color-brand-5': theme.colors.brand[5],
            '--mantine-color-brand-6': theme.colors.brand[6],
            '--mantine-color-brand-7': theme.colors.brand[7],
            '--mantine-color-brand-8': theme.colors.brand[8],
            '--mantine-color-brand-9': theme.colors.brand[9],
          },
          light: {
            '--mantine-color-brand-0': theme.colors.brand[0],
            '--mantine-color-brand-1': theme.colors.brand[1],
            '--mantine-color-brand-2': theme.colors.brand[2],
            '--mantine-color-brand-3': theme.colors.brand[3],
            '--mantine-color-brand-4': theme.colors.brand[4],
            '--mantine-color-brand-5': theme.colors.brand[5],
            '--mantine-color-brand-6': theme.colors.brand[6],
            '--mantine-color-brand-7': theme.colors.brand[7],
            '--mantine-color-brand-8': theme.colors.brand[8],
            '--mantine-color-brand-9': theme.colors.brand[9],
          },
          dark: {
            '--mantine-color-brand-0': theme.colors.brand[0],
            '--mantine-color-brand-1': theme.colors.brand[1],
            '--mantine-color-brand-2': theme.colors.brand[2],
            '--mantine-color-brand-3': theme.colors.brand[3],
            '--mantine-color-brand-4': theme.colors.brand[4],
            '--mantine-color-brand-5': theme.colors.brand[5],
            '--mantine-color-brand-6': theme.colors.brand[6],
            '--mantine-color-brand-7': theme.colors.brand[7],
            '--mantine-color-brand-8': theme.colors.brand[8],
            '--mantine-color-brand-9': theme.colors.brand[9],
          },
        })}
      >
        <Notifications position="top-right" />
        {children}
      </MantineProvider>
    </>
  );
}



