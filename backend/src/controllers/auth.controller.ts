import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Role, DocumentType } from '../types/enums';
import {
  RegisterBody,
  LoginBody,
  RechargeCreditsBody,
  CreateExperienceBody,
  UpdateProfileBody,
  JwtUserPayload,
} from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

const getBaseApiUrl = (): string => {
  return (process.env.API_URL || 'http://localhost:3000').replace(/\/+$/, '');
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      role,
      fullName,
      firstName,
      lastName,
      phone,
      address,
      documentType,
      documentNumber,
    }: RegisterBody = req.body;

    const resolvedFullName =
      (fullName && fullName.trim()) ||
      [firstName, lastName].filter(Boolean).join(' ').trim() ||
      '';

    // 1. Validaciones básicas obligatorias
    if (!email || !password || !role || !phone || !resolvedFullName) {
      res.status(400).json({
        message: 'fullName, phone, email, password y role son campos obligatorios.',
      });
      return;
    }

    if (role !== Role.CLIENT && role !== Role.PROVIDER && role !== Role.ADMIN) {
      res.status(400).json({ message: 'El rol debe ser CLIENT o PROVIDER' });
      return;
    }

    // 2. Validaciones KYC para técnicos (PROVIDER)
    if (role === Role.PROVIDER) {
      if (!address || !address.trim() || !documentType || !documentNumber || !documentNumber.trim()) {
        res.status(400).json({
          message:
            'Para técnicos es obligatorio indicar address, documentType (DNI, NIE o PASSPORT) y documentNumber.',
        });
        return;
      }

      const validDocTypes: string[] = [DocumentType.DNI, DocumentType.NIE, DocumentType.PASSPORT];
      if (!validDocTypes.includes(documentType.toUpperCase())) {
        res.status(400).json({
          message: 'documentType inválido. Los tipos permitidos son DNI, NIE o PASSPORT.',
        });
        return;
      }
    }

    // 3. Comprobar existencia previa de email
    const existingUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      res.status(409).json({ message: 'El correo electrónico ya está registrado' });
      return;
    }

    // 4. Procesar imagen de documento si se adjuntó
    let documentImageUrl: string | null = null;
    if (req.file) {
      const baseUrl = getBaseApiUrl();
      documentImageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    // 5. Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Bono de bienvenida: 5 créditos para técnicos, 0 para clientes
    const initialCredits = role === Role.PROVIDER ? 5 : 0;

    // 6. Crear usuario
    const newUser = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        role,
        fullName: resolvedFullName,
        firstName: firstName ? firstName.trim() : resolvedFullName.split(' ')[0] || null,
        lastName: lastName ? lastName.trim() : resolvedFullName.split(' ').slice(1).join(' ') || null,
        phone: phone.trim(),
        address: address ? address.trim() : null,
        documentType: documentType ? (documentType.toUpperCase() as DocumentType) : null,
        documentNumber: documentNumber ? documentNumber.trim() : null,
        documentImageUrl,
        isVerified: false,
        avatarUrl: null,
        availableCredits: initialCredits,
        frozenCredits: 0,
        rating: 5.0,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.fullName,
        phone: newUser.phone,
        availableCredits: newUser.availableCredits,
        frozenCredits: newUser.frozenCredits,
        isVerified: newUser.isVerified,
        avatarUrl: newUser.avatarUrl,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in register:', err.message);
    res.status(500).json({ message: 'Internal server error', details: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginBody = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const tokenPayload: JwtUserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone,
        availableCredits: user.availableCredits,
        frozenCredits: user.frozenCredits,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in login:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        address: true,
        documentType: true,
        documentNumber: true,
        isVerified: true,
        avatarUrl: true,
        availableCredits: true,
        frozenCredits: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        experiences: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    const err = error as Error;
    console.error('Error in getMe:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { fullName, phone, address }: UpdateProfileBody = req.body;
    let avatarUrl: string | undefined = undefined;

    if (req.file) {
      const baseUrl = getBaseApiUrl();
      avatarUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(fullName ? { fullName: fullName.trim() } : {}),
        ...(phone ? { phone: phone.trim() } : {}),
        ...(address ? { address: address.trim() } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        phone: true,
        address: true,
        avatarUrl: true,
        isVerified: true,
        availableCredits: true,
        frozenCredits: true,
        rating: true,
      },
    });

    res.status(200).json({
      message: 'Perfil actualizado con éxito',
      user: updated,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in updateProfile:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const rechargeCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== Role.PROVIDER) {
      res.status(403).json({ message: 'Solo los técnicos (PROVIDER) pueden recargar créditos.' });
      return;
    }

    const { credits, amountEur }: RechargeCreditsBody = req.body;
    const numericCredits = Number(credits);
    const numericAmountEur = Number(amountEur);

    if (!Number.isInteger(numericCredits) || numericCredits <= 0) {
      res.status(400).json({ message: 'La cantidad de créditos debe ser un número entero mayor a 0.' });
      return;
    }

    // Regla de negocio: 1 crédito = 4 EUR
    const expectedAmountEur = numericCredits * 4;
    if (numericAmountEur !== expectedAmountEur) {
      res.status(400).json({
        message: `Monto inválido. ${numericCredits} créditos equivalen exactamente a ${expectedAmountEur} EUR (4 € por crédito).`,
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        availableCredits: { increment: numericCredits },
      },
      select: {
        id: true,
        availableCredits: true,
        frozenCredits: true,
      },
    });

    res.status(200).json({
      message: 'Recarga de créditos completada con éxito.',
      creditsAdded: numericCredits,
      amountPaidEur: numericAmountEur,
      availableCredits: updatedUser.availableCredits,
      frozenCredits: updatedUser.frozenCredits,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in rechargeCredits:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== Role.PROVIDER) {
      res.status(403).json({ message: 'Solo los técnicos pueden agregar experiencias laborales.' });
      return;
    }

    const { companyName, duration, period, description }: CreateExperienceBody = req.body;

    if (!companyName || !duration || !period || !description) {
      res.status(400).json({
        message: 'companyName, duration, period y description son campos obligatorios.',
      });
      return;
    }

    // Procesar hasta 4 fotos subidas
    const files = (req.files as Express.Multer.File[]) || [];
    const baseUrl = getBaseApiUrl();
    const photoUrls = files.map((file) => `${baseUrl}/uploads/${file.filename}`);
    const testimonyPhotos = JSON.stringify(photoUrls);

    const experience = await prisma.providerExperience.create({
      data: {
        providerId: user.id,
        companyName: companyName.trim(),
        duration: duration.trim(),
        period: period.trim(),
        description: description.trim(),
        testimonyPhotos,
      },
    });

    res.status(201).json({
      message: 'Experiencia registrada con éxito.',
      experience,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in createExperience:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== Role.ADMIN) {
      res.status(403).json({ message: 'Acceso denegado: solo administradores pueden verificar técnicos.' });
      return;
    }

    const providerId = req.params.id as string;
    if (!providerId) {
      res.status(400).json({ message: 'Se requiere el ID del técnico a verificar.' });
      return;
    }

    const provider = await prisma.user.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      res.status(404).json({ message: 'Técnico no encontrado.' });
      return;
    }

    if (provider.role !== Role.PROVIDER) {
      res.status(400).json({ message: 'El usuario especificado no tiene rol PROVIDER.' });
      return;
    }

    // Purgar físicamente del disco el documento sensible para cumplir con minimización de datos RGPD
    if (provider.documentImageUrl) {
      try {
        const filename = path.basename(provider.documentImageUrl);
        const filePath = path.join(__dirname, '../../uploads', filename);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (fsErr) {
        const fileErr = fsErr as Error;
        console.warn('Aviso: no se pudo eliminar el archivo del documento (puede no existir):', fileErr.message);
      }
    }

    // Actualizar en base de datos: marcar verificado y vaciar documentImageUrl
    const updated = await prisma.user.update({
      where: { id: providerId },
      data: {
        isVerified: true,
        documentImageUrl: null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isVerified: true,
        documentImageUrl: true,
      },
    });

    res.status(200).json({
      message: 'Técnico verificado con éxito y documento sensible eliminado conforme al RGPD.',
      provider: updated,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in verifyProvider:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
