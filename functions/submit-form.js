export const onRequestPost = async ({ request, env }) => {
  let data;

  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, email, phone, eventType, message } = data;

  if (!name || !email || !phone || !eventType || !message) {
    return Response.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email address." }, { status: 400 });
  }

  const html = `
    <table style="font-family:sans-serif;font-size:14px;color:#1c0000;max-width:560px;width:100%">
      <tr><td style="padding-bottom:24px">
        <h2 style="margin:0;font-size:22px;font-weight:600">New Enquiry — ${escapeHtml(name)}</h2>
      </td></tr>
      <tr><td style="padding-bottom:12px"><strong>Name:</strong> ${escapeHtml(name)}</td></tr>
      <tr><td style="padding-bottom:12px"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td style="padding-bottom:12px"><strong>Phone:</strong> ${escapeHtml(phone)}</td></tr>
      <tr><td style="padding-bottom:12px"><strong>Event Type:</strong> ${escapeHtml(eventType)}</td></tr>
      <tr><td style="padding-top:8px;border-top:1px solid #e5e0db">
        <p style="margin:12px 0 4px;font-weight:600">Message:</p>
        <p style="margin:0;white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</p>
      </td></tr>
    </table>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Contact Form <contact@studioio.ca>",
      to: "maazh49@gmail.com",
      subject: `Studio.io Enquiry — ${name} (${eventType})`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return Response.json(
      { error: "Failed to send email. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({ success: true }, { status: 200 });
};

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
