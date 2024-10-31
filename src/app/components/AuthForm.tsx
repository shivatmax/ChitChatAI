import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/supabase';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { FaUserAstronaut } from 'react-icons/fa';
// import { rateLimiter } from '../utils/rateLimiter';
import { sanitizeInput } from '../utils/sanitize';
import { validateEmail } from '../utils/email_valid';
import {
  generateSalt,
  hashEmail,
  encrypt,
  decrypt,
  generateEncryptionKey,
} from '../utils/encryption';
import { handleAuthError } from '../utils/errorHandling';

interface AuthFormProps {
  onAuthSuccess: () => void;
  onEmailValidation?: (email: string) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onAuthSuccess,
  // onEmailValidation,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedUsername = sanitizeInput(username.trim());
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

    if (!sanitizedUsername || !sanitizedEmail) {
      setLoginError('Please fill in all fields');
      return;
    }

    if (!(await validateEmail(sanitizedEmail))) {
      setLoginError('Invalid email address');
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    try {
      // Generate encryption materials
      const salt = generateSalt();
      const emailHash = hashEmail(sanitizedEmail);
      const encryptionKey = generateEncryptionKey(
        sanitizedEmail + sanitizedUsername,
        salt
      );

      // Check for existing user first
      const { data: existingUser } = await supabase
        .from('User')
        .select('*')
        .eq('email_hash', emailHash)
        .single();

      let userId;

      if (existingUser) {
        try {
          // Verify existing user
          const storedKey = generateEncryptionKey(
            sanitizedEmail + sanitizedUsername,
            existingUser.encryption_salt
          );

          const decryptedUsername = decrypt(
            existingUser.encrypted_name,
            storedKey,
            existingUser.iv,
            existingUser.tag
          );

          if (decryptedUsername !== sanitizedUsername) {
            throw new Error('Invalid credentials');
          }

          userId = existingUser.id;
        } catch (error) {
          console.error('Decryption error:', error);
          setLoginError('Invalid username or email combination');
          return;
        }
      } else {
        // Create new user
        const encryptedEmail = encrypt(sanitizedEmail, encryptionKey);
        const encryptedUsername = encrypt(sanitizedUsername, encryptionKey);

        const newUser = {
          id: uuidv4(),
          encrypted_name: encryptedUsername.encryptedData,
          encrypted_email: encryptedEmail.encryptedData,
          email_hash: emailHash,
          encryption_salt: salt,
          encryption_key: encryptionKey.toString('hex'),
          iv: encryptedEmail.iv,
          tag: encryptedEmail.tag,
          persona: 'Enthusiastic and Friendly',
          about: 'New user',
          knowledge_base: 'Basic knowledge',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: insertedUser, error: insertError } = await supabase
          .from('User')
          .insert([newUser])
          .select()
          .single();

        if (insertError) {
          if (insertError.code === '23505') {
            throw new Error('Email already in use');
          }
          throw insertError;
        }

        userId = insertedUser.id;
      }

      localStorage.setItem('userId', userId);
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });

      onAuthSuccess();
      navigate('/');
    } catch (error) {
      const errorMessage = handleAuthError(error);
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleEmailChange');
    const email = e.target.value;
    console.log('email', email);

    if (!(await validateEmail(email))) {
      console.log('Invalid email address. Please enter a valid email.');
      setLoginError('Invalid email address. Please enter a valid email.');
      return;
    }
    console.log('Valid email address. Setting email.');
    setEmail(email);
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleAuth}>
      {loginError && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-comic-red text-lg mb-4 p-2 bg-red-100 border-2 border-comic-red rounded comic-shadow"
        >
          {loginError}
        </motion.div>
      )}

      <div className="rounded-md shadow-sm -space-y-px">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username 👤"
            className="mb-4 text-xl p-4 comic-border comic-shadow"
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => handleEmailChange(e)}
            placeholder="Email address 📧"
            className="mb-4 text-xl p-4 comic-border comic-shadow"
          />
        </motion.div>
      </div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          type="submit"
          className="w-full bg-comic-green hover:bg-comic-blue text-black text-2xl font-bold py-4 px-6 rounded-full comic-border comic-shadow transition duration-300 ease-in-out transform hover:-translate-y-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: 'linear',
              }}
            >
              <FaUserAstronaut className="inline-block mr-2" />
              Blasting Off... 🚀
            </motion.div>
          ) : (
            <>Enter Chitchat !!! 🌟</>
          )}
        </Button>
      </motion.div>
    </form>
  );
};

export default AuthForm;
