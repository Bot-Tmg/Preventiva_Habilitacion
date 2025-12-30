import { openDB } from '../config/sqlite.js';

export class User {
  static async create(userData) {
    const { email, password_hash, user_type, full_name, phone } = userData;
    const db = await openDB();
    
    const result = await db.run(
      `INSERT INTO users (email, password_hash, user_type, full_name, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, password_hash, user_type, full_name, phone]
    );
    
    return { id: result.lastID, email, user_type, full_name };
  }

  static async findByEmail(email) {
    const db = await openDB();
    return await db.get(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
  }

  static async findById(id) {
    const db = await openDB();
    return await db.get(
      'SELECT id, email, user_type, full_name, created_at FROM users WHERE id = ?', 
      [id]
    );
  }
}