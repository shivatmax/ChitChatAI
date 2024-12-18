import { logger, schedules } from '@trigger.dev/sdk/v3';
import prisma from '../app/lib/prisma';

export const updateTodaysSummaryTask = schedules.task({
  id: 'update-todays-summary',
  cron: '53 7 * * *', // 1:23 PM IST (UTC+5:30)
  maxDuration: 60,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run: async (payload, { ctx }) => {
    try {
      const result = await prisma.user.updateMany({
        where: {
          todaysSummary: true,
        },
        data: {
          todaysSummary: false,
        },
      });

      logger.debug('Updated todaysSummary for users', {
        updatedCount: result.count,
        timestamp: payload.timestamp,
      });
    } catch (error) {
      logger.error('Error updating todaysSummary', { error });
      throw error;
    }
  },
});
