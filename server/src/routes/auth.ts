import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { generateToken, AuthPayload } from '../middleware/auth.js';
import { db } from '../db/index.js';

const SALT_ROUNDS = 10;

/**
 * Register authentication routes
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/auth/register
   * Register a new player
   */
  fastify.post<{
    Body: {
      playerName: string;
      password: string;
    }
  }>('/api/auth/register', async (request, reply) => {
    try {
      const { playerName, password } = request.body;

      // Validation
      if (!playerName || !password) {
        return reply.status(400).send({ 
          error: 'Player name and password are required',
          code: 'MISSING_FIELDS'
        });
      }

      if (playerName.length < 3 || playerName.length > 20) {
        return reply.status(400).send({ 
          error: 'Player name must be between 3 and 20 characters',
          code: 'INVALID_NAME_LENGTH'
        });
      }

      if (password.length < 6) {
        return reply.status(400).send({ 
          error: 'Password must be at least 6 characters',
          code: 'INVALID_PASSWORD_LENGTH'
        });
      }

      // Check if player already exists
      const existingPlayer = db.prepare('SELECT id FROM players WHERE name = ?').get(playerName);
      if (existingPlayer) {
        return reply.status(409).send({ 
          error: 'Player name already exists',
          code: 'DUPLICATE_PLAYER'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Create player
      const result = db.prepare(
        'INSERT INTO players (name, password_hash, role) VALUES (?, ?, ?)'
      ).run(playerName, hashedPassword, 'player');

      const playerId = result.lastInsertRowid.toString();

      // Generate token
      const payload: AuthPayload = {
        playerId,
        playerName,
        role: 'player'
      };

      const token = generateToken(payload);

      return reply.status(201).send({
        success: true,
        token,
        player: {
          id: playerId,
          name: playerName,
          role: 'player'
        }
      });
    } catch (error) {
      fastify.log.error('Registration error: ' + (error instanceof Error ? error.message : String(error)));
      return reply.status(500).send({ 
        error: 'Failed to register player',
        code: 'REGISTRATION_FAILED'
      });
    }
  });

  /**
   * POST /api/auth/login
   * Authenticate player
   */
  fastify.post<{
    Body: {
      playerName: string;
      password: string;
    }
  }>('/api/auth/login', async (request, reply) => {
    try {
      const { playerName, password } = request.body;

      if (!playerName || !password) {
        return reply.status(400).send({ 
          error: 'Player name and password are required',
          code: 'MISSING_FIELDS'
        });
      }

      // Find player
      const player = db.prepare('SELECT * FROM players WHERE name = ?').get(playerName) as any;
      if (!player) {
        return reply.status(401).send({ 
          error: 'Invalid player name or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, player.password_hash);
      if (!validPassword) {
        return reply.status(401).send({ 
          error: 'Invalid player name or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Generate token
      const payload: AuthPayload = {
        playerId: player.id.toString(),
        playerName: player.name,
        role: player.role || 'player'
      };

      const token = generateToken(payload);

      // Update last login
      db.prepare('UPDATE players SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(player.id);

      return reply.send({
        success: true,
        token,
        player: {
          id: player.id.toString(),
          name: player.name,
          role: player.role || 'player'
        }
      });
    } catch (error) {
      fastify.log.error('Login error: ' + (error instanceof Error ? error.message : String(error)));
      return reply.status(500).send({ 
        error: 'Failed to login',
        code: 'LOGIN_FAILED'
      });
    }
  });

  /**
   * GET /api/auth/verify
   * Verify current token
   */
  fastify.get('/api/auth/verify', async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ 
        valid: false,
        error: 'No token provided'
      });
    }

    const { verifyToken } = await import('../middleware/auth.js');
    const token = authHeader.substring(7);
    const user = verifyToken(token);

    if (!user) {
      return reply.status(401).send({ 
        valid: false,
        error: 'Invalid or expired token'
      });
    }

    return reply.send({
      valid: true,
      user: {
        playerId: user.playerId,
        playerName: user.playerName,
        role: user.role
      }
    });
  });

  /**
   * POST /api/auth/refresh
   * Refresh token (extend expiration)
   */
  fastify.post('/api/auth/refresh', async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ 
        error: 'No token provided',
        code: 'MISSING_TOKEN'
      });
    }

    const { verifyToken, generateToken } = await import('../middleware/auth.js');
    const token = authHeader.substring(7);
    const user = verifyToken(token);

    if (!user) {
      return reply.status(401).send({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Generate new token
    const newToken = generateToken(user);

    return reply.send({
      success: true,
      token: newToken
    });
  });
}
