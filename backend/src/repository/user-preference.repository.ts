import { prisma } from "../database/prisma.js";

export interface UserPreferences {
  defaultModel: string;
  temperature: number;
  theme: string;
  accentColor: string;
}

const DEFAULT_PREFS: UserPreferences = {
  defaultModel: "gemini-2.5-flash",
  temperature: 0.3,
  theme: "dark",
  accentColor: "violet",
};

export const getPreferences = async (
  userId: string
): Promise<UserPreferences> => {
  const pref = await prisma.userPreference.findUnique({
    where: { userId },
  });

  if (!pref) return DEFAULT_PREFS;

  return {
    defaultModel: pref.defaultModel,
    temperature: pref.temperature,
    theme: pref.theme,
    accentColor: pref.accentColor,
  };
};

export const upsertPreferences = async (
  userId: string,
  data: Partial<UserPreferences>
): Promise<UserPreferences> => {
  const existing = await prisma.userPreference.findUnique({
    where: { userId },
  });

  if (existing) {
    const updated = await prisma.userPreference.update({
      where: { userId },
      data,
    });
    return {
      defaultModel: updated.defaultModel,
      temperature: updated.temperature,
      theme: updated.theme,
      accentColor: updated.accentColor,
    };
  }

  const created = await prisma.userPreference.create({
    data: {
      userId,
      ...DEFAULT_PREFS,
      ...data,
    },
  });

  return {
    defaultModel: created.defaultModel,
    temperature: created.temperature,
    theme: created.theme,
    accentColor: created.accentColor,
  };
};
