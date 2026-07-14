import { prisma } from "../database/prisma.js";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export async function deleteAccountController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { email: true } });

      if (!user) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
      }

      await tx.verification.deleteMany({ where: { identifier: user.email } });
      await tx.user.delete({ where: { id: userId } });
    });

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("[USER] Delete account error:", error);
    res.status(500).json({ success: false, error: "Failed to delete account" });
  }
}

export async function changePasswordController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: "Current and new password are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ success: false, error: "New password must be at least 8 characters" });
      return;
    }

    // Find the credential account
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "credential",
      },
    });

    if (!account || !account.password) {
      res.status(400).json({ success: false, error: "No password-based account found. You may have signed up with a social provider." });
      return;
    }

    // Verify current password
    const valid = await verifyPassword({
      password: currentPassword,
      hash: account.password,
    });

    if (!valid) {
      res.status(400).json({ success: false, error: "Current password is incorrect" });
      return;
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);

    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("[USER] Change password error:", error);
    res.status(500).json({ success: false, error: "Failed to change password" });
  }
}

export async function exportDataController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        repositories: {
          include: {
            files: {
              include: {
                chunks: true,
                symbols: true,
              },
            },
          },
        },
        accounts: {
          select: { providerId: true, createdAt: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      repositories: user.repositories.map((repo) => ({
        id: repo.id,
        name: repo.name,
        githubUrl: repo.githubUrl,
        localPath: repo.localPath,
        createdAt: repo.createdAt,
        filesCount: repo.files.length,
        chunksCount: repo.files.reduce((s, f) => s + f.chunks.length, 0),
      })),
      connectedAccounts: user.accounts,
    };

    res.json({ success: true, data: exportData });
  } catch (error) {
    console.error("[USER] Export data error:", error);
    res.status(500).json({ success: false, error: "Failed to export data" });
  }
}

export async function clearCacheController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    await prisma.verification.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    res.json({ success: true, message: "Cache cleared successfully" });
  } catch (error) {
    console.error("[USER] Clear cache error:", error);
    res.status(500).json({ success: false, error: "Failed to clear cache" });
  }
}
