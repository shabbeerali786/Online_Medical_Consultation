import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';

function minutes(n) {
  return n * 60 * 1000;
}

async function processNoShow(appointment, reason) {
  try {
    appointment.status = 'cancelled-no-show';
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = reason;
    await appointment.save();

    await appointment.populate('patient', 'name');
    await appointment.populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    const doctorUserId = appointment?.doctor?.user?._id;
    const patientUserId = appointment?.patient?._id;
    const content = `Appointment cancelled – Patient No Show. ${reason}`;

    // Create system notifications as messages in both directions (so both see it)
    const msgs = [];
    if (doctorUserId && patientUserId) {
      msgs.push({
        appointment: appointment._id,
        sender: doctorUserId,
        receiver: patientUserId,
        content,
        messageType: 'system',
      });
      msgs.push({
        appointment: appointment._id,
        sender: patientUserId,
        receiver: doctorUserId,
        content,
        messageType: 'system',
      });
      await Message.insertMany(msgs);
    }
    // eslint-disable-next-line no-console
    console.log(`[auto-cancel] Marked ${appointment._id} as cancelled-no-show (${reason})`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auto-cancel] Failed processing no-show:', err.message);
  }
}

async function runAutoCancelOnce() {
  const now = new Date();
  const confirmWindowMinutes = parseInt(process.env.APPOINTMENT_CONFIRMATION_MINUTES || '60', 10);
  const checkinGraceMinutes = parseInt(process.env.APPOINTMENT_CHECKIN_GRACE_MINUTES || '0', 10);

  // 1) Cancel appointments not confirmed within confirmation window
  const confirmCutoff = new Date(now.getTime() - minutes(confirmWindowMinutes));
  const overdueUnconfirmed = await Appointment.find({
    status: 'scheduled',
    createdAt: { $lte: confirmCutoff },
  }).limit(200);

  for (const appt of overdueUnconfirmed) {
    await processNoShow(appt, 'Patient did not confirm within the required time.');
  }

  // 2) Cancel appointments not checked in before session start (with optional grace)
  const checkinDeadline = new Date(now.getTime() - minutes(checkinGraceMinutes));
  const overdueCheckin = await Appointment.find({
    status: { $in: ['scheduled', 'confirmed'] },
    dateTime: { $lte: checkinDeadline },
    $or: [
      { checkedInAt: { $exists: false } },
      { checkedInAt: null },
    ],
  }).limit(200);

  for (const appt of overdueCheckin) {
    await processNoShow(appt, "Patient didn't check in before the session start time.");
  }
}

export function startAutoCancellationJob() {
  const pollSeconds = parseInt(process.env.AUTO_CANCELLATION_POLL_SECONDS || '60', 10);
  // Initial run, then interval
  runAutoCancelOnce().catch((e) => console.error('[auto-cancel] Initial run failed:', e.message));
  const timer = setInterval(() => {
    runAutoCancelOnce().catch((e) => console.error('[auto-cancel] Interval run failed:', e.message));
  }, pollSeconds * 1000);
  // eslint-disable-next-line no-console
  console.log(`[auto-cancel] Job started. Poll every ${pollSeconds}s`);
  return timer;
}
