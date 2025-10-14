import 'dotenv/config';
import { createNotificationService } from '../src/services/notifications/notification.service';
import prisma from '../src/db/client';

async function main() {
  const [, , maybeNumber, ...messageParts] = process.argv;

  console.log('Preparing to send Twilio test SMS...');

  const seedEmail = process.env.SEED_CREATOR_EMAIL ?? 'creator@example.com';
  const fallbackMessage =
    '👋 Griphyn test message: your Twilio number is wired up and ready to send deal alerts.';

  const creator = await prisma.creator.findFirst({
    where: { email: seedEmail },
  });

  if (!creator) {
    console.error(`No creator found with email ${seedEmail}. Seed the database before testing SMS.`);
    process.exit(1);
  }

  const targetNumber = maybeNumber ?? creator.phoneNumber ?? process.env.SEED_CREATOR_PHONE ?? null;

  if (!targetNumber) {
    console.error(
      'Provide a phone number to send the test SMS.\n' +
        'Usage: pnpm --filter @griphyn/server sms:test +12345551234 "Optional message"',
    );
    process.exit(1);
  }

  if (creator.phoneNumber !== targetNumber) {
    console.log(`Updating creator phone number from ${creator.phoneNumber ?? 'unset'} to ${targetNumber}...`);
    await prisma.creator.update({
      where: { id: creator.id },
      data: { phoneNumber: targetNumber },
    });
  }

  console.log(`Sending SMS to ${targetNumber}...`);

  const messageBody = messageParts.length > 0 ? messageParts.join(' ') : fallbackMessage;

  const notificationService = createNotificationService();

  const response = await notificationService.sendSms({
    creatorId: creator.id,
    creatorPhoneNumber: targetNumber,
    message: messageBody,
    context: {
      source: 'sms-test-script',
    },
  });

  if (!response) {
    console.error('Twilio client not initialized. Check environment variables for account SID and auth token.');
    process.exit(1);
  }

  console.log(`✅ SMS sent to ${targetNumber}. Twilio SID: ${response.sid}`);
}

main()
  .catch((error) => {
    console.error('Failed to send test SMS:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
