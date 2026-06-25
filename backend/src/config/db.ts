import { supabase } from './supabase';
import { logger } from './logger';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Connects to Supabase with exponential back-off retry.
 * Will attempt 3 times before calling process.exit(1).
 */
export const connectDB = async (): Promise<void> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { error } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      logger.info('Supabase connected successfully');
      return;
    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES;
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1); // 1s, 2s, 4s

      if (isLastAttempt) {
        logger.fatal(
          { err: error },
          `Failed to connect to Supabase after ${MAX_RETRIES} attempts. Exiting.`,
        );
        process.exit(1);
      }

      logger.warn(
        { attempt, nextRetryMs: delay },
        `Supabase connection failed. Retrying in ${delay}ms...`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
