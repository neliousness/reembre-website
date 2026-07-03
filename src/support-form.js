export const MIN_SUPPORT_MESSAGE_LENGTH = 12;

export function resolveSupportEndpoint({
  supportEndpoint = '',
  waitlistEndpoint = '',
} = {}) {
  if (supportEndpoint) return supportEndpoint;
  if (!waitlistEndpoint) return '';
  return waitlistEndpoint.replace(/\/waitlist\/?$/, '/support');
}

export function validateSupportFields({ topic = '', message = '' } = {}) {
  const cleanTopic = topic.trim();
  const cleanMessage = message.trim();

  if (cleanMessage.length === 0) {
    return {
      ok: false,
      field: 'message',
      message: 'Write a message so we know what to look into.',
    };
  }

  if (cleanMessage.length < MIN_SUPPORT_MESSAGE_LENGTH) {
    return {
      ok: false,
      field: 'message',
      message: 'Add a little more detail so we can help.',
    };
  }

  if (!cleanTopic) {
    return {
      ok: false,
      field: 'topic',
      message: 'Choose a support topic.',
    };
  }

  return { ok: true };
}
